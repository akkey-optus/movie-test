import CeresImage from "@/src/assert/plant/Ceres.png";
import EarthImage from "@/src/assert/plant/Earth.png";
import EnceladusImage from "@/src/assert/plant/Enceladus.png";
import EuropaImage from "@/src/assert/plant/Europa.png";
import IoImage from "@/src/assert/plant/Io.png";
import JupiterImage from "@/src/assert/plant/Jupiter.png";
import MarsImage from "@/src/assert/plant/Mars.png";
import MercuryImage from "@/src/assert/plant/Mercury.png";
import MoonImage from "@/src/assert/plant/Moon.png";
import NeptuneImage from "@/src/assert/plant/Neptune.png";
import PlutoImage from "@/src/assert/plant/Pluto.png";
import SaturnImage from "@/src/assert/plant/saturn.png";
import SunImage from "@/src/assert/plant/Sun.png";
import TitanImage from "@/src/assert/plant/Titan.png";
import UranusImage from "@/src/assert/plant/Uranus.png";
import VenusImage from "@/src/assert/plant/Venus.png";

type PlanetArtwork = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type PlanetAssetModule = string | { src: string };

function resolvePlanetAssetSrc(asset: PlanetAssetModule) {
  return typeof asset === "string" ? asset : asset.src;
}

const PLANET_RESULT_ARTWORK: Record<string, PlanetArtwork> = {
  土星: { src: resolvePlanetAssetSrc(SaturnImage), alt: "土星结果配图" },
  月球: { src: resolvePlanetAssetSrc(MoonImage), alt: "月球结果配图" },
  海王星: { src: resolvePlanetAssetSrc(NeptuneImage), alt: "海王星结果配图" },
  冥王星: { src: resolvePlanetAssetSrc(PlutoImage), alt: "冥王星结果配图" },
  火星: { src: resolvePlanetAssetSrc(MarsImage), alt: "火星结果配图" },
  金星: { src: resolvePlanetAssetSrc(VenusImage), alt: "金星结果配图" },
  木卫二: { src: resolvePlanetAssetSrc(EuropaImage), alt: "木卫二结果配图" },
  天王星: { src: resolvePlanetAssetSrc(UranusImage), alt: "天王星结果配图" },
  木星: { src: resolvePlanetAssetSrc(JupiterImage), alt: "木星结果配图" },
  水星: { src: resolvePlanetAssetSrc(MercuryImage), alt: "水星结果配图" },
  土卫六: { src: resolvePlanetAssetSrc(TitanImage), alt: "土卫六结果配图" },
  木卫一: { src: resolvePlanetAssetSrc(IoImage), alt: "木卫一结果配图" },
  地球: { src: resolvePlanetAssetSrc(EarthImage), alt: "地球结果配图" },
  谷神星: { src: resolvePlanetAssetSrc(CeresImage), alt: "谷神星结果配图" },
  太阳: { src: resolvePlanetAssetSrc(SunImage), alt: "太阳结果配图" },
  土卫二: { src: resolvePlanetAssetSrc(EnceladusImage), alt: "土卫二结果配图" },
};

export function getPlanetResultArtwork(title: string) {
  return PLANET_RESULT_ARTWORK[title] ?? null;
}
