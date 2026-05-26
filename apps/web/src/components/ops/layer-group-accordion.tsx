import type { LayerDefinition, LayerGroup } from "@/types/operational";
import { LayerToggle } from "@/components/ops/layer-toggle";

export function LayerGroupAccordion({
  title,
  layers,
  activeLayerIds,
  onToggle
}: {
  title: LayerGroup;
  layers: LayerDefinition[];
  activeLayerIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</h3>
        <span className="text-xs text-slate-500">{layers.length}</span>
      </div>
      <div className="space-y-2">
        {layers.map((layer) => (
          <LayerToggle
            key={layer.id}
            layer={layer}
            active={activeLayerIds.includes(layer.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

