import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Category, Link } from "./types";

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: [] as Category[],
    reducers: {
        addCategory: (state: Category[], { payload }: { payload: Category }) => {
            const categories = [...state];
            categories.push(payload);
            return categories;
        },
        editCategory: (state: Category[], { payload }: { payload: Category }) => {
            const categories = [...state];
            const categoryIndex = categories.findIndex(category => category.id === payload.id);
            if (categoryIndex === -1) {
                return categories
            }

            categories[categoryIndex] = payload;
            return categories;
        },
        removeCategory: (state: Category[], { payload }: { payload: Category }) => {
            const categories = [...state];
            const categoryIndex = categories.findIndex(category => category.id === payload.id);
            if (categoryIndex === -1) {
                return categories
            }

            categories.slice(categoryIndex, 1);
            return categories;
        },

        addLink: (state: Category[], { payload }: { payload: Link }) => {
            const categories = [...state];
            const categoryIndex = state.findIndex(link => link.id === payload.id);
            if (categoryIndex === -1) {
                return categories;
            }

            categories[categoryIndex].links.push(payload);
            return categories;
        },
        editLink: (state: Category[], { payload }: { payload: Link }) => {
            const categories = [...state];
            const categoryIndex = state.findIndex(link => link.id === payload.id);
            if (categoryIndex === -1) {
                return categories;
            }

            const linkIndex = categories[categoryIndex].links.findIndex(link => link.id === payload.id);
            if (linkIndex === -1) {
                return categories;
            }

            categories[categoryIndex].links[linkIndex] = payload;
            return categories;
        },
        removeLink: (state: Category[], { payload }: { payload: Link }) => {
            const categories = [...state];
            const categoryIndex = state.findIndex(link => link.id === payload.id);
            if (categoryIndex === -1) {
                return categories;
            }

            const linkIndex = categories[categoryIndex].links.findIndex(link => link.id === payload.id);
            if (linkIndex === -1) {
                return categories;
            }

            categories[categoryIndex].links.splice(linkIndex, 1);
            return categories;
        },
    }
});

export const store = configureStore({
    reducer: {
        categories: categoriesSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});

export const {
    addCategory,
    addLink,
    editLink,
    removeLink
} = categoriesSlice.actions;