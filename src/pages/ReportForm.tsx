import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Camera, Upload, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ReportForm = () => {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { toast } = useToast();

  const problemTypes = [
    "Ordures", "Éclairage public", "Voirie", "Inondations",
    "Approvisionnement en eau", "Électricité", "Sécurité",
    "Infrastructures", "Espaces verts", "Services publics", "Autre"
  ];

  const communes = [
    "Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu",
    "Kimbanseke", "Kinshasa", "Kintambo", "Kisenso", "Lemba", "Limete",
    "Lingwala", "Makala", "Maluku", "Masina", "Matete", "Mont-Ngafula",
    "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "N'sele", "Selembao"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 5 images maximum.",
        variant: "destructive"
      });
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement Supabase submission
    setTimeout(() => {
      toast({
        title: "Signalement envoyé !",
        description: "Votre signalement a été transmis aux autorités compétentes.",
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Signaler un problème
            </h1>
            <p className="text-muted-foreground">
              Aidez-nous à améliorer Kinshasa en signalant les problèmes de votre quartier
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Nouveau signalement</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Signalement anonyme</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre identité ne sera pas révélée
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  {isAnonymous ? "Anonyme" : "Avec identité"}
                </Button>
              </div>

              {/* Problem Type */}
              <div className="space-y-2">
                <Label htmlFor="problemType">Type de problème *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de problème" />
                  </SelectTrigger>
                  <SelectContent>
                    {problemTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commune">Commune *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre commune" />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map((commune) => (
                        <SelectItem key={commune} value={commune.toLowerCase()}>
                          {commune}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input
                    id="quartier"
                    placeholder="Nom du quartier"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresse exacte *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Avenue, rue, croisement..."
                    className="pl-9"
                    required
                  />
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  Localiser sur la carte
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description du problème *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le problème de manière détaillée..."
                  className="min-h-32"
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <Label>Photos du problème</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ajouter des photos</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG jusqu'à 5MB chacune (max 5 photos)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir des fichiers
                    </Button>
                  </div>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Niveau d'urgence</Label>
                <div className="flex gap-2">
                  {[
                    { level: "Bas", color: "bg-green-100 text-green-800" },
                    { level: "Moyen", color: "bg-yellow-100 text-yellow-800" },
                    { level: "Élevé", color: "bg-red-100 text-red-800" }
                  ].map((priority) => (
                    <Badge 
                      key={priority.level}
                      variant="outline" 
                      className={`cursor-pointer hover:${priority.color} ${priority.color}`}
                    >
                      {priority.level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Info (if not anonymous) */}
              {!isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nom complet</Label>
                    <Input
                      id="contactName"
                      placeholder="Votre nom"
                      required={!isAnonymous}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Téléphone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+243 XXX XXX XXX"
                      required={!isAnonymous}
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  variant="cta"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le signalement"}
                </Button>
                <Button type="button" variant="outline">
                  Sauvegarder comme brouillon
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Info */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary mb-2">
              💡 Conseils pour un bon signalement
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Soyez précis dans la description du problème</li>
              <li>• Ajoutez des photos claires si possible</li>
              <li>• Indiquez l'adresse exacte ou des repères</li>
              <li>• Vérifiez que le problème n'a pas déjà été signalé</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportForm;