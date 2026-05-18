import ModuleAdForm from "../ModuleAdForm";

export default function LogisticsPostPage() {
  return (
    <ModuleAdForm
      module="logistics"
      title="Post Logistics Service"
      subtitle="Offer transport, loading, cold chain, warehouse or delivery services."
      categoryLabel="Vehicle / Service Type"
      categoryOptions={[
        "Truck",
        "Mazda",
        "Pickup",
        "Loader Rickshaw",
        "Tractor Trolley",
        "Cold Chain",
        "Warehouse",
        "Loading Labour",
        "Delivery Service",
      ]}
    />
  );
}
