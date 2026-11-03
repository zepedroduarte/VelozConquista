// Dados estruturados para o Google e assistentes de IA (não é executado pelo browser).
export function JsonLd({ data }: { data: object | null }) {
    if (!data) return null;
    // "<" escapado para que um texto vindo da base de dados nunca feche a tag <script>
    const json = JSON.stringify(data).replace(/</g, "\\u003c");
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
