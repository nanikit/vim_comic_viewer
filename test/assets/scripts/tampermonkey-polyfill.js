const resources = [...header.matchAll(/@resource\s+(\S+)\s+(\S+)/g)];

const GM = {
  addValueChangeListener: () => {},
  getValue: () => {},
  getResourceText: async (key) => {
    const resource = resources.find(([, k]) => k === key);
    if (!resource) {
      throw new Error(`Resource ${key} not found`);
    }

    const response = await fetch(resource[2]);
    return response.text();
  },
  info: {
    script: { resources: resources.map(([, key]) => ({ name: key })) },
  },
  removeValueChangeListener: () => {},
  setValue: () => {},
  xmlHttpRequest: () => {},
};

const unsafeWindow = window;
