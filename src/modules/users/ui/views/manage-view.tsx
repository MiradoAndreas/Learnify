"use client"
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DangerZoneSection } from "../sections/danger-zone-section";
import { AvatarUploadSection } from "../sections/avatar-upload-section";
import { ProfileFormSection } from "../sections/profile-form-section";
import { SocialLinksFormSection } from "../sections/social-links-form-section";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { motion } from "framer-motion"

export const ManageView = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-accent"
            >
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Mon profil
              </h1>
              <p className="text-sm text-muted-foreground">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-8">
            {/* Navigation tabs améliorée */}
            <div className="border-b border-border">
              <TabsList className="h-12 bg-transparent p-0">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-6 text-muted-foreground data-[state=active]:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    Profil
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-6 text-muted-foreground data-[state=active]:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    Réseaux sociaux
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="danger"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:shadow-none rounded-none h-full px-6 text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    Zone de danger
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Contenu des tabs avec animations */}
            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
              <Card className="overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-card border-b border-border">
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                    Photo de profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="shrink-0">
                      <AvatarUploadSection size="lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Téléchargez une photo qui vous représente. Les formats JPEG, PNG et WebP sont acceptés.
                        Taille maximale : 4MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ProfileFormSection />
            </TabsContent>

            <TabsContent value="social" className="animate-in fade-in duration-300">
              <SocialLinksFormSection />
            </TabsContent>

            <TabsContent value="danger" className="animate-in fade-in duration-300">
              <div>
                <DangerZoneSection />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  )
}