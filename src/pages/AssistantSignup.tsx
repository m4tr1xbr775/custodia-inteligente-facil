
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssistantLink } from "@/hooks/useAssistantLink";
import MagistrateSelector from "@/components/Contatos/MagistrateSelector";
import { ArrowLeft, UserPlus } from "lucide-react";

const AssistantSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    mobile: "",
    department: "",
    magistrateId: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { magistrates, loadingMagistrates } = useAssistantLink();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.magistrateId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email, senha e selecione um magistrado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Cadastrar o usuário no Supabase Auth primeiro
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            profile: 'Assessor de Juiz'
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Cadastrar o contato na tabela contacts com user_id
        const { error: contactError } = await supabase
          .from('contacts')
          .insert({
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            mobile: formData.mobile,
            department: formData.department,
            profile: 'Assessor de Juiz',
            linked_magistrate_id: formData.magistrateId,
            active: false
          });

        if (contactError) {
          console.error('Erro ao cadastrar contato:', contactError);
          // Se falhar ao criar contato, tentar excluir o usuário do Auth
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Erro ao criar perfil do usuário');
        }
      }

      toast({
        title: "Cadastro realizado",
        description: "Seu cadastro foi enviado e aguarda aprovação do administrador.",
      });

      navigate('/auth');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || 'Erro ao realizar cadastro',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMagistrate = magistrates.find(m => m.id === formData.magistrateId);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Cadastro de Assessor
              </CardTitle>
              <CardDescription>
                Preencha todos os dados
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Sua senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Serventia de Origem</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Ex: 1ª Vara Criminal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Celular</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label>Magistrado para vínculo *</Label>
            {loadingMagistrates ? (
              <div className="text-center py-4">Carregando magistrados...</div>
            ) : (
              <MagistrateSelector
                magistrates={magistrates}
                value={formData.magistrateId}
                onValueChange={(value) => handleInputChange('magistrateId', value)}
                required
                placeholder="Selecione o magistrado para vínculo"
              />
            )}
          </div>

          {selectedMagistrate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Magistrado selecionado:</p>
              <p className="text-blue-700">{selectedMagistrate.name}</p>
            </div>
          )}

          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Seu cadastro será enviado para aprovação do administrador. 
              Você receberá um email quando for aprovado.
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!formData.magistrateId || !formData.name || !formData.email || !formData.password || isLoading}
          >
            {isLoading ? "Enviando..." : "Finalizar Cadastro"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantSignup;
