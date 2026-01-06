import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <ChevronLeft className="w-5 h-5 mr-1" />
      Retour
    </Button>
  );
}