import ReactDOM from "react-dom";
import React, { useEffect, useRef } from "react";

import EventEmitter2 from "eventemitter2";

import {
  YMapCollection as _YMapCollection,
  YMap as _YMap,
  YMapMarker as _YMapMarker,
} from "@yandex/ymaps3-types";

import { IUpdate } from "../interfaces/IUpdate";

import { departments } from "../data";

const ymaps3Reactify = await ymaps3.import("@yandex/ymaps3-reactify");
const reactify = ymaps3Reactify.reactify.bindTo(React, ReactDOM);
const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapListener,
  YMapCollection,
} = reactify.module(ymaps3);

const mapMarkerEffectKeyframes = [
  {
    filter: "brightness(100%) blur(0px)",
    transform: "translate(-50%, -50%) scale(100%)",
    opacity: 1,
  },
  {
    filter: "brightness(200%) blur(1px)",
    transform: "translate(-50%, -50%) scale(2000%)",
    opacity: 0,
  },
];

const MapEffectMarkers: React.FC<{ eventBus: EventEmitter2 }> = ({
  eventBus,
}) => {
  const effectMarkersCollection = useRef<_YMapCollection>(null);

  useEffect(() => {
    const handleUpdate = (update: IUpdate) => {
      for (const added of update.diff.added) {
        const department = departments.find(
          (d) => d.id === added.department_id
        );

        if (!department) {
          return;
        }

        const markerContent = document.createElement("div");
        markerContent.className = "map__marker";

        markerContent
          .animate(mapMarkerEffectKeyframes, {
            fill: "forwards",
            duration: 1000,
          })
          .addEventListener(
            "finish",
            () => {
              effectMarkersCollection.current?.removeChild(marker);
            },
            {
              once: true,
            }
          );

        const marker = new ymaps3.YMapMarker(
          {
            coordinates: [department.lon, department.lat],
          },
          markerContent
        );

        effectMarkersCollection.current?.addChild(marker);
      }
    };

    eventBus.on("update", handleUpdate);

    return () => {
      eventBus.off("update", handleUpdate);
    };
  }, [eventBus]);

  return <YMapCollection ref={effectMarkersCollection} />;
};

export interface MapProps {
  eventBus: EventEmitter2;

  onVisibleChange: (visible: number[]) => void;
}

export const Map: React.FC<MapProps> = ({ eventBus, onVisibleChange }) => {
  const map = useRef<_YMap>(null);

  const handleMapUpdate = () => {
    if (!map.current) {
      return;
    }

    const visible = map.current.children
      .filter(
        (child): child is _YMapMarker & { properties: { id: number } } => {
          if (!(child instanceof ymaps3.YMapMarker)) {
            return false;
          }

          if (!child.properties?.id) return false;

          const rect = child.element.getBoundingClientRect();

          return (
            rect.left > 0 &&
            rect.top > 0 &&
            rect.left < innerWidth &&
            rect.top < innerHeight
          );
        }
      )
      .map((child) => child.properties.id);

    onVisibleChange(visible);
  };

  return (
    <YMap
      location={{ center: [60.6122, 56.8519], zoom: 6 }}
      mode="vector"
      ref={map}
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapListener onUpdate={handleMapUpdate} />

      {departments.map((d) => (
        <YMapMarker
          coordinates={[d.lon, d.lat]}
          key={d.id}
          properties={{ id: d.id }}
        >
          <div className="map__marker"></div>
        </YMapMarker>
      ))}

      <MapEffectMarkers eventBus={eventBus} />
    </YMap>
  );
};
