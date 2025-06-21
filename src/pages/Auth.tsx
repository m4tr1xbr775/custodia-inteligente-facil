
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminHint, setShowAdminHint] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: '',
    mobile: '',
    profile: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    console.log('🔐 Tentando fazer login com:', loginData.email);
    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      console.error('❌ Erro no login:', error);
      
      // Se o erro for de credenciais inválidas e o email for do admin, mostrar dica
      if (error.message === 'Invalid login credentials' && loginData.email === 'm4tr1xbr@gmail.com') {
        setShowAdminHint(true);
      }
      
      toast({
        title: "Erro no login",
        description: error.message === 'Invalid login credentials' 
          ? "Email ou senha incorretos." 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
    }

    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.department || !signupData.profile) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp({
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
      department: signupData.department,
      phone: signupData.phone,
      mobile: signupData.mobile,
      profile: signupData.profile,
    });

    if (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message === 'User already registered' 
          ? "Este email já está cadastrado." 
          : error.message,
        variant: "destructive",
      });
    } else {
      // Reset form
      setSignupData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        phone: '',
        mobile: '',
        profile: ''
      });
    }

    setIsSubmitting(false);
  };

  const fillAdminData = () => {
    setSignupData({
      name: 'Credson Batista',
      email: 'm4tr1xbr@gmail.com',
      password: 'Admin123!',
      confirmPassword: 'Admin123!',
      department: '3ª UJS - CRIMINAL',
      phone: '62984452619',
      mobile: '62984452619',
      profile: 'Administrador'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">SisJud</h2>
          <p className="mt-2 text-gray-600">Sistema Judiciário</p>
        </div>

        {showAdminHint && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Usuário administrador não encontrado!</strong><br />
              Você precisa criar a conta do administrador primeiro. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-orange-800 underline ml-1"
                onClick={() => {
                  fillAdminData();
                  setShowAdminHint(false);
                }}
              >
                Clique aqui para preencher os dados automaticamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Cadastro</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar no Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        placeholder="Sua senha"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar-se</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nome Completo *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-department">Serventia de Origem *</Label>
                    <Input
                      id="signup-department"
                      type="text"
                      value={signupData.department}
                      onChange={(e) => setSignupData({...signupData, department: e.target.value})}
                      placeholder="Sua serventia de origem"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-profile">Perfil *</Label>
                    <Select value={signupData.profile} onValueChange={(value) => setSignupData({...signupData, profile: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Juiz">Juiz</SelectItem>
                        <SelectItem value="Promotor">Promotor</SelectItem>
                        <SelectItem value="Defensor Público">Defensor Público</SelectItem>
                        <SelectItem value="Advogado">Advogado</SelectItem>
                        <SelectItem value="Polícia Penal">Polícia Penal</SelectItem>
                        <SelectItem value="Assessor de Juiz">Assessor de Juiz</SelectItem>
                        <SelectItem value="Analista">Analista</SelectItem>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone">Telefone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      placeholder="(11) 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-mobile">Celular</Label>
                    <Input
                      id="signup-mobile"
                      type="tel"
                      value={signupData.mobile}
                      onChange={(e) => setSignupData({...signupData, mobile: e.target.value})}
                      placeholder="(11) 91234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm-password">Confirmar Senha *</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      placeholder="Confirme sua senha"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                  
                  <p className="text-sm text-gray-600 text-center">
                    Após o cadastro, aguarde a aprovação do administrador para acessar o sistema.
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
