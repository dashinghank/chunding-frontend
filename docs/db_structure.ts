interface logs {
  [documentId: string]: {
    created: number;
    message: string;
  };
}

interface products {
  [documentId: string]: {
    displayName: string;
    price: number;
    max: number;
    pid: string;
    sku: string;
    vid: string;
  };
}

interface members {
  [documentId: string]: {
    account: string;
    ancestors: string[]; //urlsuffixs
    commissionPercentage: number;
    depth: number;
    instaId: string;
    isAgentProduct: boolean;
    isInGroup: boolean;
    islocked: boolean;
    kolname: string;
    lastLoginDatetime: number;
    lineid: string;
    nickname: string;
    parent: string;
    password: string;
    phonenumber: string;
    registerDatetime: number;
    urlsuffix: string;
    role: string;
    products: {
      [productDocId: string]: number;
    };
    verifiedStatus: number;
  };
}

interface orders {
  [documentId: string]: {
    amount: number;
    createdAt: number;
    customer: string;
    email: string;
    fullyPaid: boolean;
    id: string;
    items: {
      [productDocId: string]: {
        commissions: {
          [urlsuffix: string]: number;
        };
        max: number;
        quantity: number;
        price: number;
        sku: string;
        title: string;
      };
    };
    name: string;
    totalCommissions: {
      [urlsuffix: string]: number;
    };
    updatedAt: number;
    urlsuffix: string;
  };
}

interface systems {
  [documentId: string]: {
    lastUpdatedDatetime: number;
  };
}
