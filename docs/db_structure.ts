interface logs {
  [documentId: string]: {
    datetime: number;
    message: string;
  };
}

interface products {
  [documentId: string]: {
    handle: string;
    price: number;
  };
}

interface members {
  [documentId: string]: {
    account: string;
    password: string;
    nickname: string;
    depth: number;
    islocked: boolean;
    ancestors: string[]; //urlsuffixs
    registerDatetime: number;
    lastLoginDatetime: number;
    urlsuffix: string;
    role: string;
    products: {
      [productDocId: string]: number;
    };
  };
}

interface orders {
  [documentId: string]: {
    amount: number;
    createdAt: number;
    updatedAt: number;
    customer: string;
    email: string;
    fullyPaid: boolean;
    items: {
      [productDocId: string]: {
        commissions: {
          [urlsuffix: string]: number;
        };
        quantity: number;
        sku: string;
        title: string;
      };
    };
    urlsuffix: string;
    name: string;
  };
}

interface systems {
  [documentId: string]: {
    lastUpdatedTime: number;
  };
}
