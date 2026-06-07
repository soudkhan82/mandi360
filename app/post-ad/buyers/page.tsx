import ModuleAdForm from "../ModuleAdForm";

export const dynamic = "force-dynamic";

export default function BuyersPostPage() {
  return (
    <ModuleAdForm
      module="buyers"
      title="Post Buyer Requirement"
      subtitle="Add a buyer requirement. Admin approval is required before publishing."
      categoryLabel="Product Category"
      categoryOptions={[
        "Fruits",
        "Vegetables",
        "Grains",
        "Pulses",
        "Oil Seeds",
        "Livestock Feed",
        "Agri Inputs",
        "Packaging Material",
        "Other",
      ]}
    />
  );
}
