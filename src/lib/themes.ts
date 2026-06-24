import type { ThemeColor } from "@/types"

export const THEMES: Record<ThemeColor, {
  label: string
  brand: string
  brandHover: string
  brandLight: string
  brandLighter: string
  brandBorder: string
  preview: string
}> = {
  green: {
    label:        "Menta",
    brand:        "#A8CEBA",
    brandHover:   "#90BBAA",
    brandLight:   "#EAF5EF",
    brandLighter: "#F4FAF7",
    brandBorder:  "#CAE8D8",
    preview:      "#C0DDD0",
  },
  lavender: {
    label:        "Lavanda",
    brand:        "#C0B8DC",
    brandHover:   "#A8A0CC",
    brandLight:   "#F0EDF8",
    brandLighter: "#F8F5FC",
    brandBorder:  "#DCDAF0",
    preview:      "#D4CEEA",
  },
  blue: {
    label:        "Cielo",
    brand:        "#A8C8DC",
    brandHover:   "#90B4CC",
    brandLight:   "#E8F3F9",
    brandLighter: "#F2F8FC",
    brandBorder:  "#C8DFEE",
    preview:      "#BDD4E8",
  },
  rose: {
    label:        "Rosa",
    brand:        "#DCC0C8",
    brandHover:   "#C8AABA",
    brandLight:   "#FAEFF2",
    brandLighter: "#FDF5F7",
    brandBorder:  "#EEDCE2",
    preview:      "#E8CED6",
  },
  amber: {
    label:        "Melocotón",
    brand:        "#DEC8A8",
    brandHover:   "#CCB490",
    brandLight:   "#FAF3E8",
    brandLighter: "#FDF9F2",
    brandBorder:  "#EEE0C8",
    preview:      "#E8D4B4",
  },
  teal: {
    label:        "Turquesa",
    brand:        "#A8CECE",
    brandHover:   "#90BCBC",
    brandLight:   "#E5F3F3",
    brandLighter: "#F0F9F9",
    brandBorder:  "#C8E4E4",
    preview:      "#BCD8D8",
  },
  beige: {
    label:        "Beige",
    brand:        "#DDD0BC",
    brandHover:   "#CCBCA8",
    brandLight:   "#FAF5EC",
    brandLighter: "#FDF9F3",
    brandBorder:  "#EEE4D2",
    preview:      "#E8DCC8",
  },
  gray: {
    label:        "Gris perla",
    brand:        "#BEC8D0",
    brandHover:   "#A8B4BC",
    brandLight:   "#EDF1F4",
    brandLighter: "#F4F7F9",
    brandBorder:  "#D4DCE4",
    preview:      "#CAD4DC",
  },
  mono: {
    label:        "Blanco y negro",
    brand:        "#1A1D1B",
    brandHover:   "#2D2D2D",
    brandLight:   "#F2F2F2",
    brandLighter: "#F8F8F8",
    brandBorder:  "#D4D4D4",
    preview:      "#444444",
  },
}

export function getThemeCss(color: ThemeColor): string {
  const t = THEMES[color]
  return `
    --brand: ${t.brand};
    --brand-hover: ${t.brandHover};
    --brand-light: ${t.brandLight};
    --brand-lighter: ${t.brandLighter};
    --brand-border: ${t.brandBorder};
    --background: #F7F8F9;
    --border: #E8ECEA;
    --primary: ${t.brand};
  `
}
