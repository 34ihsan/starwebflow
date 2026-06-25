import { Metadata } from "next";
import TemplatesClient from "./TemplatesClient";

export const metadata: Metadata = {
  title: "AI Canvas & Şablonlar | StarWebflow",
  description: "Dinamik AI E-posta Şablonları ve Drip Kampanya Yönetimi",
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
