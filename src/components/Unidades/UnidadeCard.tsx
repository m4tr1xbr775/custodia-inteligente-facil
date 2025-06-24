
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, MapPin, Eye, Edit, Trash2 } from "lucide-react";

interface PrisonUnit {
  id: string;
  name: string;
  short_name: string;
  type: "CDP" | "Presídio" | "CPP";
  comarca: string;
  director: string;
  responsible: string;
  landline: string;
  functional: string;
  whatsapp: string;
  email: string;
  address: string;
  municipalities: string;
  number_of_rooms: number;
}

interface UnidadeCardProps {
  unit: PrisonUnit;
  onView: (unit: PrisonUnit) => void;
  onEdit: (unit: PrisonUnit) => void;
  onDelete: (unitId: string) => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string, unitName: string) => void;
}

const UnidadeCard = ({ 
  unit, 
  onView, 
  onEdit, 
  onDelete, 
  onCall, 
  onWhatsApp 
}: UnidadeCardProps) => {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CDP":
        return <Badge className="bg-blue-100 text-blue-800">CDP</Badge>;
      case "Presídio":
        return <Badge className="bg-green-100 text-green-800">Presídio</Badge>;
      case "CPP":
        return <Badge className="bg-purple-100 text-purple-800">CPP</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const municipalitiesArray = typeof unit.municipalities === 'string' 
    ? unit.municipalities.split(',').map(m => m.trim()).filter(m => m !== '') 
    : [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{unit.name}</h3>
                {getTypeBadge(unit.type)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Comarca:</span> {unit.comarca}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Diretor:</span> {unit.director}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Responsável:</span> {unit.responsible}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Telefone:</span> {unit.landline}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Funcional:</span> {unit.functional}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">WhatsApp:</span> {unit.whatsapp}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Salas para Audiências:</span> {unit.number_of_rooms}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Capacidade por Slot:</span> {unit.number_of_rooms} audiência{unit.number_of_rooms > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {municipalitiesArray.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Municípios Atendidos:</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {municipalitiesArray.map((municipality: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {municipality}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {unit.address && (
                <div className="mt-3 flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{unit.address}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2 lg:ml-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(unit)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(unit)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(unit.id)}
                  className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCall(unit.landline)}
                  className="flex items-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Ligar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWhatsApp(unit.whatsapp, unit.short_name)}
                  className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnidadeCard;
