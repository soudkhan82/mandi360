import ModuleAdForm from "../ModuleAdForm";

export default function AgriInputsPostPage() {
  return (
    <ModuleAdForm
      module="agri-inputs"
      title="Post Agri Input"
      subtitle="Sell seeds, fertilizer, pesticides, equipment, tools or farm inputs."
      categoryLabel="Input Type"
      categoryOptions={[
        "Seeds",
        "Fertilizer",
        "Pesticide",
        "Herbicide",
        "Fungicide",
        "Farm Tools",
        "Irrigation Equipment",
        "Animal Feed",
      ]}
    />
  );
}
