
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Scale, AlertCircle, UserPlus } from "lucide-react";

const userProfiles = [
  "Analista",
  "Policial Penal", 
  "Administrador",
  "Magistrado",
  "Promotor",
  "Defensor Público"
];

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique suas credenciais.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email não confirmado. Verifique sua caixa de entrada.");
        } else {
          setError(error.message);
        }
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao SisJud.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no login:", error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !profile) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Cadastrar o usuário no Supabase Auth primeiro
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            profile: profile
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
            name: name,
            email: email,
            profile: profile,
            active: profile === 'Administrador' ? true : false // Admin ativo, outros aguardam aprovação
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
        description: profile === 'Administrador' 
          ? "Cadastro realizado com sucesso! Você pode fazer login agora."
          : "Seu cadastro foi enviado e aguarda aprovação do administrador.",
      });

      setMode("login");
      setName("");
      setProfile("");
      setPassword("");
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      setError(error.message || 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">SisJud</h2>
          <p className="mt-2 text-gray-600">Sistema Judiciário de Audiências</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === "login" ? "Entrar" : "Cadastrar"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "login" 
                ? "Digite suas credenciais para acessar o sistema"
                : "Preencha os dados para criar sua conta"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile">Perfil *</Label>
                    <Select value={profile} onValueChange={setProfile} required disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {userProfiles.map((profileOption) => (
                          <SelectItem key={profileOption} value={profileOption}>
                            {profileOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Entrando..." : "Cadastrando..."}
                  </>
                ) : (
                  mode === "login" ? "Entrar" : "Cadastrar"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
              >
                {mode === "login" 
                   <UserPlus className="mr-2 h-4 w-4" />
                  ? "Não tem conta? Cadastre-se" 
                  : "Já tem conta? Faça login"
                }
              </Button>
              
              {mode === "login" && (
                <>
                  <p className="text-sm text-gray-600">ou</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/assistant-signup')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar como Assessor
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 SisJud. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
