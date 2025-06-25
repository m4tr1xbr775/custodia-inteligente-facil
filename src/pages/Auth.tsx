
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scale, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [serventia, setServentia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message.includes("Invalid login credentials")
          ? "Email ou senha incorretos. Verifique suas credenciais."
          : error.message.includes("Email not confirmed")
          ? "Email não confirmado. Verifique sua caixa de entrada."
          : error.message);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      toast({ title: "Login realizado com sucesso!", description: "Bem-vindo ao SisJud." });
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
    if (!name || !email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, serventia, telefone, celular },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      if (authError) throw authError;
      toast({
        title: "Cadastro realizado",
        description: "Cadastro enviado com sucesso. Aguarde aprovação."
      });
      setMode("login");
      setName(""); setEmail(""); setPassword(""); setServentia(""); setTelefone(""); setCelular("");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      setError(error.message || "Erro ao realizar cadastro");
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
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              {mode === "signup" && <UserPlus className="w-6 h-6" />}
              {mode === "login" ? "Entrar" : "Cadastro de Assessor"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "login"
                ? "Digite suas credenciais para acessar o sistema"
                : "Preencha todos os dados"}
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
                  <Label>Nome completo *</Label>
                  <Input placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
                  <Label>Serventia de Origem</Label>
                  <Input placeholder="Ex: 1ª Vara Criminal" value={serventia} onChange={(e) => setServentia(e.target.value)} disabled={isLoading} />
                  <Label>Telefone</Label>
                  <Input placeholder="(11) 1234-5678" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isLoading} />
                  <Label>Celular</Label>
                  <Input placeholder="(11) 99999-9999" value={celular} onChange={(e) => setCelular(e.target.value)} disabled={isLoading} />
                </>
              )}
              <Label>Email *</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              <Label>Senha *</Label>
              <Input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === "login" ? "Entrando..." : "Cadastrando..."}</>) : (mode === "login" ? "Entrar" : "Cadastrar")}
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
                  ? (<><UserPlus className="mr-2 h-4 w-4" /> Cadastre-se</>)
                  : (<><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login</>)}
              </Button>
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


