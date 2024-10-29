import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PokemonCardProps {
  name: string;
  imageUrl: string;
  types: string[];
  isShiny: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  count: number;
}

export function PokemonCard({
  name,
  imageUrl,
  types,
  isShiny,
  isLegendary,
  isMythical,
  count
}: PokemonCardProps) {
  const cardClass = isShiny
    ? 'bg-yellow-500/20'
    : isLegendary
    ? 'bg-purple-500/20'
    : isMythical
    ? 'bg-blue-500/20'
    : 'bg-accent/50';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${cardClass} backdrop-blur-sm relative group`}>
      {count > 1 && (
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            variant="secondary" 
            className="bg-background/80 backdrop-blur-sm font-bold text-primary"
          >
            x{count}
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-accent/30 mb-4 group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <img
            src={imageUrl}
            alt={name}
            className="object-contain w-full h-full transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold capitalize text-lg">{name}</h3>
          </div>
          
          <div className="flex flex-wrap gap-1 justify-center">
            {types.map((type) => (
              <span key={type} className={`pokemon-type type-${type}`}>
                {type}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {isShiny && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                ✨ Shiny
              </Badge>
            )}
            {isLegendary && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                👑 Lendário
              </Badge>
            )}
            {isMythical && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                🌟 Mítico
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}