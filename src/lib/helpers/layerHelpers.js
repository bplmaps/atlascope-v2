export const parseLayerChoices = (historicLayers, referenceLayers) => {
    let c = [];
    // push the layers which are more than 20% visible to the layerChoices array, mapping the appropriate variables for menu generation
    historicLayers
      .sort((a, b) => a.properties.year - b.properties.year)
      .forEach((d) => {
        if (d.extentVisible > 0.2) {
          c.push({
            id: d.properties.identifier,
            title: d.properties.fallbackTitle
              ? d.properties.fallbackTitle
              : d.properties.year,
            subtitle: d.properties.fallbackSubtitle
              ? d.properties.fallbackSubtitle
              : d.properties.publisherShort,
            pct: d.extentVisible,
          });
        }
      });
    // add the reference layers
    referenceLayers.forEach((d) =>
      c.push({
        id: d.properties.identifier,
        title: d.properties.fallbackTitle
          ? d.properties.fallbackTitle
          : d.properties.year,
        subtitle: d.properties.fallbackSubtitle
          ? d.properties.fallbackSubtitle
          : d.properties.publisherShort,
        pct: 1.0,
      }),
    );
    return c;
  }