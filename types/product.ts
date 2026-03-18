export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface FormattedProduct extends Product {
  formattedTitle: string;
  formattedPrice: string;
  formattedCategory: string;
}
