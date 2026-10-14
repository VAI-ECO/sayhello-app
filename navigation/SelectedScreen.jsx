import React from "react";
import AuthNavigation from "./AuthNavigation";

// Every role uses the complete onboarding stack, including when signed in.
export default function SelectedScreen() {
  return <AuthNavigation initialRouteName="Selectedlanguage" />;
}
