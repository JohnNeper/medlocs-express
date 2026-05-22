import { useEffect, useState, type ComponentType } from "react";
import type { Pharmacy } from "@/lib/medlocs-data";

type Props = {
  height?: string;
  onPharmacyClick?: (p: Pharmacy) => void;
  pharmacies?: Pharmacy[];
  center?: [number, number];
};

export function LeafletMap(props: Props) {
  const [Inner, setInner] = useState<ComponentType<Props> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./LeafletMap.inner").then((mod) => {
      if (!cancelled) setInner(() => mod.default);
    });
    return () => { cancelled = true; };
  }, []);

  if (!Inner) {
    return <div className={`w-full ${props.height ?? "h-64"} rounded-2xl bg-primary-soft animate-pulse`} />;
  }
  return <Inner {...props} />;
}
