import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FamilyCounts } from '@/types/beneficiary';

interface FamilyCountsGridProps {
  values: FamilyCounts;
  onChange: (field: keyof FamilyCounts, value: number) => void;
}

const FAMILY_FIELDS: { key: keyof FamilyCounts; label: string; shortLabel: string }[] = [
  { key: 'adulto_h', label: 'Adulto Hombre', shortLabel: 'Adulto H' },
  { key: 'adulto_m', label: 'Adulto Mujer', shortLabel: 'Adulto M' },
  { key: 'nino_0_5', label: 'Niño 0-5 años', shortLabel: 'Niño 0-5' },
  { key: 'nina_0_5', label: 'Niña 0-5 años', shortLabel: 'Niña 0-5' },
  { key: 'nino_6_18', label: 'Niño 6-18 años', shortLabel: 'Niño 6-18' },
  { key: 'nina_6_18', label: 'Niña 6-18 años', shortLabel: 'Niña 6-18' },
  { key: 'mayor_60_hom', label: 'Mayor 60 Hombre', shortLabel: '>60 Hom' },
  { key: 'mayor_60_muj', label: 'Mayor 60 Mujer', shortLabel: '>60 Muj' },
  { key: 'pcd_h', label: 'Persona con Discapacidad H', shortLabel: 'PCD H' },
  { key: 'pcd_m', label: 'Persona con Discapacidad M', shortLabel: 'PCD M' },
];

export function FamilyCountsGrid({ values, onChange }: FamilyCountsGridProps) {
  const handleIncrement = (key: keyof FamilyCounts) => {
    onChange(key, values[key] + 1);
  };

  const handleDecrement = (key: keyof FamilyCounts) => {
    if (values[key] > 0) {
      onChange(key, values[key] - 1);
    }
  };

  const handleInputChange = (key: keyof FamilyCounts, inputValue: string) => {
    const num = parseInt(inputValue, 10);
    onChange(key, isNaN(num) ? 0 : Math.max(0, num));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {FAMILY_FIELDS.map(({ key, label, shortLabel }) => (
        <div 
          key={key} 
          className="bg-muted/50 rounded-lg p-3 border border-border"
        >
          <Label 
            htmlFor={key} 
            className="text-xs text-muted-foreground block mb-2 text-center"
            title={label}
          >
            {shortLabel}
          </Label>
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => handleDecrement(key)}
              aria-label={`Disminuir ${label}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              id={key}
              type="number"
              min={0}
              value={values[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-14 h-8 text-center text-sm font-medium px-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => handleIncrement(key)}
              aria-label={`Aumentar ${label}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
