import { Card, CardContent } from '@/components/ui/card';

interface PokemonCardProps {
  name: string;
  imageUrl: string;
  types: string[];
  isShiny?: boolean;
  isLegendary?: boolean;
  isMythical?: boolean;
  count?: number;
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
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${cardClass} backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-accent/30 mb-4">
          <img
            src={imageUrl}
            alt={name}
            className="object-contain w-full h-full transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold capitalize text-lg text-center">{name}</h3>
          
          <div className="flex flex-wrap gap-1 justify-center">
            {types.map((type) => (
              <span key={type} className={`pokemon-type type-${type}`}>
                {type}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {isShiny && (
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                ✨ Shiny
              </span>
            )}
            {isLegendary && (
              <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                👑 Legendary
              </span>
            )}
            {isMythical && (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                🌟 Mythical
              </span>
            )}
          </div>

          {count !== undefined && count > 1 && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Quantidade: {count}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}