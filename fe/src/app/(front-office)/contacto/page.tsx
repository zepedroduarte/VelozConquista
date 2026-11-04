import { ContactPage } from "@/components/app/ContactPage";
import { getCompany } from "@/lib/api-server";

export default async function Contact() {
    const company = await getCompany();
    return <ContactPage company={company} />;
}
