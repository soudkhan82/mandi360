import ModuleAdForm from "../ModuleAdForm";

export default function ConsultantsPostPage() {
  return (
    <ModuleAdForm
      module="consultants"
      title="Post Consultant Service"
      subtitle="Offer crop, livestock, soil, irrigation or agri-business consulting."
      categoryLabel="Consulting Type"
      categoryOptions={[
        "Crop Consultant",
        "Soil Consultant",
        "Livestock Consultant",
        "Irrigation Consultant",
        "Farm Management",
        "Agri Business Consultant",
        "Pest Management",
        "Horticulture Consultant",
      ]}
    />
  );
}
