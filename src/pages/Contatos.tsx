
import { useContacts } from "@/hooks/useContacts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, User } from "lucide-react";

const Contatos = () => {
  const { data: contacts, isLoading, error } = useContacts();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Erro ao carregar contatos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts?.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-start justify-between">
                <span>{contact.name}</span>
                {contact.regions && (
                  <Badge variant="outline" className="text-xs">
                    {contact.regions.type === 'macrorregiao' ? 'Macrorregião' : 'Central de Custódia'}
                  </Badge>
                )}
              </CardTitle>
              {contact.position && (
                <p className="text-sm text-gray-600 font-medium">{contact.position}</p>
              )}
              {contact.department && (
                <p className="text-sm text-gray-500">{contact.department}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              
              {contact.mobile && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <a 
                    href={`tel:${contact.mobile}`}
                    className="text-green-600 hover:underline"
                  >
                    {contact.mobile} <span className="text-xs text-gray-500">(celular)</span>
                  </a>
                </div>
              )}
              
              {contact.regions && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{contact.regions.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum contato encontrado
            </h3>
            <p className="text-gray-600">
              Não há contatos cadastrados no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contatos;
