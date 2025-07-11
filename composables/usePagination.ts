interface IPaginationParams {
  name: string;
  variable: Ref<any>;
  path?: string[];
  defaultValue?: any;
}

const setNestedValue = (obj: Ref<any>, path: string[], value: any) => {
  if (!obj.value) {
    obj.value = {};
    obj.value[path.join(".")] = value;
    return;
  }

  const lastKey = path.pop()!;
  const lastObj = path.reduce(
    (acc, key) => (acc[key] = acc[key] || {}),
    obj.value
  );
  if (lastObj) {
    lastObj[lastKey] = value;
  }
};

const getNestedValue = (obj: any, path: string[]) => {
  return path.reduce((acc, key) => acc && acc[key], obj);
};

export const usePagination = (data: IPaginationParams[]) => {
  const route = useRoute();
  const router = useRouter();
  const paramMap = new Map(data.map((item) => [item.name, item]));

  watch(
    () =>
      data.map((item) => {
        const path = item.path || [];
        return path.length > 0
          ? getNestedValue(item.variable.value, path)
          : item.variable.value;
      }),
    () => {
      const currentQuery = { ...route.query };
      let hasChanges = false;

      paramMap.forEach((item, name) => {
        const path = item.path || [];
        const valueToCompare =
          path.length > 0
            ? getNestedValue(item.variable.value, path)
            : item.variable.value;

        if (valueToCompare === undefined || valueToCompare === null) {
          delete currentQuery[name];
          hasChanges = true;
          return;
        }

        if ("defaultValue" in item && valueToCompare === item.defaultValue) {
          if (name in currentQuery) {
            delete currentQuery[name];
            hasChanges = true;
          }
        } else if (currentQuery[name] !== valueToCompare) {
          currentQuery[name] = valueToCompare;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        router.push({ query: currentQuery });
      }
    },
    { deep: true }
  );

  Object.entries(route.query).forEach(([name, value]) => {
    const item = paramMap.get(name);
    if (item) {
      const newValue =
        typeof item.defaultValue === "number" ? +String(value) : value;
      const path = item.path || [];

      if (path.length > 0) {
        setNestedValue(item.variable, [...path], newValue);
      } else {
        item.variable.value = newValue;
      }
    }
  });
};
