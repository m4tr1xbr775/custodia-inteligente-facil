
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";
import { getPrisonUnitTypeLabel } from "@/utils/prisonUnitUtils";

interface PrisonUnit {
  type: string;
}

interface UnidadesStatsProps {
  units: PrisonUnit[];
}

const UnidadesStats = ({ units }: UnidadesStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total de Unidades</p>
              <p className="text-2xl font-bold text-blue-900">{units.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg text-white font-bold text-xs">
              UPR
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">UPRs</p>
              <p className="text-2xl font-bold text-green-900">
                {units.filter(u => u.type === 'UPR').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg text-white font-bold text-xs">
              CPP
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">CPPs</p>
              <p className="text-2xl font-bold text-purple-900">
                {units.filter(u => u.type === 'CPP' || u.type === 'CDP').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white font-bold text-xs">
              PE
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800">Presídios</p>
              <p className="text-2xl font-bold text-orange-900">
                {units.filter(u => u.type === 'Presídio Estadual' || u.type === 'Presídio').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-pink-50 border-pink-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-pink-500 p-2 rounded-lg text-white font-bold text-xs">
              PF
            </div>
            <div>
              <p className="text-sm font-medium text-pink-800">Femininas</p>
              <p className="text-2xl font-bold text-pink-900">
                {units.filter(u => u.type === 'Penitenciária Feminina').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnidadesStats;
