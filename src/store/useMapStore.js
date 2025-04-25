import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMapStore = create(
  persist(
    (set) => ({
      features: [],
      activeFeature: null,

      addFeature: (feature) =>
        set((state) => ({
          features: [
            ...state.features,
            {
              ...feature,
              id: `feature-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              createdAt: new Date(),
            },
          ],
        })),

      updateFeature: (id, updatedData) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, ...updatedData } : f
          ),
        })),

      deleteFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== id),
          activeFeature:
            state.activeFeature?.id === id ? null : state.activeFeature,
        })),

      setActiveFeature: (feature) => set({ activeFeature: feature }),

      clearActiveFeature: () => set({ activeFeature: null }),

      // Function to get feature by ID
      getFeatureById: (id) => {
        const state = useMapStore.getState();
        return state.features.find((f) => f.id === id);
      },
    }),
    {
      name: "gis-features-storage",
    }
  )
);

export default useMapStore;
