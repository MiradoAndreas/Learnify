import { db } from "@/db";
import { courseLessons } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set");

  const body = await request.text(); // important pour signature
  const payload = JSON.parse(body);

  const muxSignature = request.headers.get("mux-signature") || "";

  try {
    mux.webhooks.verifySignature(
      body,
      { "mux-signature": muxSignature },
      SIGNING_SECRET
    );
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("No upload ID found", { status: 400 });

      await db
        .update(courseLessons)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(courseLessons.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("Missing upload ID", { status: 400 });

      const playbackId = data.playback_ids?.[0].id;
      if (!playbackId)
        return new Response("Missing playback ID", { status: 400 });

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      // On n’upload plus de thumbnail ni preview
      await db
        .update(courseLessons)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          duration,
        })
        .where(eq(courseLessons.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("Missing upload ID", { status: 400 });

      await db
        .update(courseLessons)
        .set({ muxStatus: data.status })
        .where(eq(courseLessons.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("Missing upload ID", { status: 400 });

      await db
        .delete(courseLessons)
        .where(eq(courseLessons.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };
      if (!data.asset_id)
        return new Response("Missing asset ID", { status: 400 });

      await db
        .update(courseLessons)
        .set({ muxTrackId: data.id, muxTrackStatus: data.status })
        .where(eq(courseLessons.muxAssetId, data.asset_id));
      break;
    }

    default:
      console.warn("Unhandled webhook type: ", payload.type);
      break;
  }

  return new Response("Webhook received", { status: 200 });
};
