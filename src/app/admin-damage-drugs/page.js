import React from "react";
import DamageDrugsTable from "../../../components/DamageDrugsTable";
import Navbar from "../../../components/Navbar";
import AdminDamageDrugs from "../../../components/AdminDamageDrugs";

function page() {
  return (
    <div>
      <Navbar />
      <AdminDamageDrugs />
    </div>
  );
}

export default page;
