'use client';

import React from 'react';
import { TotalCaloriesCard } from './TotalCaloriesCard';

interface TrackerOverviewCardProps {
  summary: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    water?: number;
  };
  waterTotalMl?: number;
}

export function TrackerOverviewCard(props: TrackerOverviewCardProps) {
  return <TotalCaloriesCard {...props} />;
}
