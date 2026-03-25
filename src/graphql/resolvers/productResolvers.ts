// Store w pamięci (w prawdziwej aplikacji użyj bazy danych)
const productsStore = [
  { id: 1, name: 'John Doe', company: 'john@example.com' },
  { id: 2, name: 'Jane Smith', company: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', company: 'alice@example.com' },
];

// Konwersja GraphQL ID (string) na number
const getNumericId = (id: string | number): number => {
  const parsed = typeof id === 'string' ? parseInt(id, 10) : id;
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid ID supplied');
  }
  return parsed;
};

const getNextId = (): number => {
  if (productsStore.length === 0) {
    return 1;
  }
  return Math.max(...productsStore.map((product) => product.id)) + 1;
};

export const productResolvers = {
  Query: {
    products: () => {
      return productsStore;
    },
    product: (_parent: any, args: { id: string }) => {
      const id = getNumericId(args.id);
      const product = productsStore.find((product) => product.id === id) ?? null;
      return product;
    },
  },
  Mutation: {
    createProduct: (_parent: any, args: { input: { name: string; company: string } }) => {
      const nextId = getNextId();
      const newProduct = {
        id: nextId,
        name: args.input.name,
        company: args.input.company,
      };
      productsStore.push(newProduct);
      return newProduct;
    },
    updateProduct: (_parent: any, args: { id: string; input: { name: string; company: string } }) => {
      const id = getNumericId(args.id);
      const productIndex = productsStore.findIndex((product) => product.id === id);
      if (productIndex === -1) {
        throw new Error(`Product with id ${id} not found.`);
      }
      const updatedProduct = {
        ...productsStore[productIndex],
        name: args.input.name,
        company: args.input.company,
      };
      productsStore[productIndex] = updatedProduct;
      console.log('Mutation: updateProduct - zaktualizowano użytkownika:', updatedProduct);
      return updatedProduct;
    },
    // Mutation: deleteProduct - usuwa użytkownika
    deleteProduct: (_parent: any, args: { id: string }) => {
      const id = getNumericId(args.id);
      const productIndex = productsStore.findIndex((product) => product.id === id);
      if (productIndex === -1) {
        console.log('Mutation: deleteProduct - użytkownik nie znaleziony:', id);
        return false;
      }
      productsStore.splice(productIndex, 1);
      console.log('Mutation: deleteProduct - usunięto użytkownika:', id);
      return true;
    },
  },
  // Resolver dla pola Product.id - konwertuje number na string (GraphQL ID)
  Product: {
    id: (product: { id: number }) => {
      return product.id.toString();
    },
  },
};

