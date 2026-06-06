import ModuleAdForm from "../ModuleAdForm";

export default function ProducePostPage() {
  return (
    <ModuleAdForm
      module="produce"
      title="Sell Produce"
      subtitle="Add simple crop details. Admin approval is required before publishing."
      categoryLabel="Crop / Produce Type"
      categoryOptions={[
        "Wheat",
        "Rice",
        "Maize",
        "Cotton",
        "Sugarcane",
        "Potato",
        "Onion",
        "Tomato",
        "Mango",
        "Citrus",
        "Banana",
        "Fodder",
        "Other",
      ]}
    />
  );
}
