import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Urls  = {
    baseUrl:'http://localhost:8001',
}

export {Urls}