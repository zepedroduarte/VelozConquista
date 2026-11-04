import { ContactPage } from "@/components/app/ContactPage";
import { getAllVehicles, getCompany } from "@/lib/api-server";

export default async function Contact() {
    const [company, vehicles] = await Promise.all([getCompany(), getAllVehicles().catch(() => [])]);
    // Só id e nome: chega para preencher o assunto quando se vem de uma viatura (?viatura=20)
    const options = vehicles.map((v) => {
        const { make, model, version, year } = v.vehicle_data;
        return { id: v.id, title: `${[make, model, version].filter(Boolean).join(" ")} (${year})` };
    });
    return <ContactPage company={company} vehicles={options} />;
}
