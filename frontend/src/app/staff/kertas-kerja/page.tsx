"use client";

import React from "react";
import WorksheetOperator from "@/components/kertas-kerja/WorksheetOperator";

export default function StaffKertasKerjaPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <WorksheetOperator isEselonRole={false} />
    </div>
  );
}
