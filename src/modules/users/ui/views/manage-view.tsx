

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

export const ManageView = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-gray-100"
            >
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
            <div className="border-b">
              <TabsList className="h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="profile"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-6"
                >
                  <span className="flex items-center gap-2">
                    Profil
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="social"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-6"
                >
                  <span className="flex items-center gap-2">
                    Réseaux sociaux
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="danger"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-600 data-[state=active]:shadow-none rounded-none h-full px-6"
                >
                  <span className="flex items-center gap-2">
                    Zone de danger
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Contenu des tabs avec animations */}
            <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
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
    </div>
  )
}