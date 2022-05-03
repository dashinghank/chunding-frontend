interface logs {
  [documentId: string]: {
    datetime: number;
    message: string;
  };
}

interface products {
  [documentId: string]: {
    default: number;
    handle: string;
    price: number;
    exceptionProducts: {
      [urlsuffix: string]: number;
    };
  };
}

interface members {
  [documentId: string]: {
    account: string;
    password: string;
    nickname: string;
    depth: number;
    islocked: boolean;
    parent: string;
    registerDatetime: number;
    lastLoginDatetime: number;
    urlsuffix: string;
    role: string;
    downlines: {
      [urlsuffix: string]: {
        [productDocId: string]: number;
      };
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
