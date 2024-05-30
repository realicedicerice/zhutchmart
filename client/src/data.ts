import cities from "./assets/cities.json";

export const departments = cities.flatMap((city) => city.departments);

export const departmentIds = departments.map((d) => d.id);
