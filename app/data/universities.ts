import type { LatLngExpression } from "leaflet";

export interface University {
  name: string;
  position: LatLngExpression;
  posts: number;
  users: number;
  address: {
    city: string;
    state: string;
    country: string;
  };
}

export const universities: University[] = [
  {
    name: "MIT",
    position: [42.3601, -71.0942],
    posts: 0,
    users: 0,
    address: {
      city: "Cambridge",
      state: "Massachusetts",
      country: "United States"
    }
  },
  {
    name: "Stanford University",
    position: [37.4275, -122.1697],
    posts: 0,
    users: 0,
    address: {
      city: "Stanford",
      state: "California",
      country: "United States"
    }
  },
  {
    name: "University of Cambridge",
    position: [52.2043, 0.1149],
    posts: 0,
    users: 0,
    address: {
      city: "Cambridge",
      state: "Cambridgeshire",
      country: "United Kingdom"
    }
  },
  {
    name: "UC Berkeley",
    position: [37.8719, -122.2585],
    posts: 0,
    users: 0,
    address: {
      city: "Berkeley",
      state: "California",
      country: "United States"
    }
  },
  {
    name: "Carnegie Mellon University",
    position: [40.4428, -79.9428],
    posts: 0,
    users: 0,
    address: {
      city: "Pittsburgh",
      state: "Pennsylvania",
      country: "United States"
    }
  },
  {
    name: "Georgia Institute of Technology",
    position: [33.7756, -84.3963],
    posts: 0,
    users: 0,
    address: {
      city: "Atlanta",
      state: "Georgia",
      country: "United States"
    }
  },
  {
    name: "University of Toronto",
    position: [43.6629, -79.3957],
    posts: 0,
    users: 0,
    address: {
      city: "Toronto",
      state: "Ontario",
      country: "Canada"
    }
  },
  {
    name: "ETH Zurich",
    position: [47.3769, 8.5417],
    posts: 0,
    users: 0,
    address: {
      city: "Zurich",
      state: "Zurich",
      country: "Switzerland"
    }
  },
  {
    name: "National University of Singapore",
    position: [1.2966, 103.7764],
    posts: 0,
    users: 0,
    address: {
      city: "Singapore",
      state: "Singapore",
      country: "Singapore"
    }
  },
  {
    name: "University of Tokyo",
    position: [35.7127, 139.7622],
    posts: 0,
    users: 0,
    address: {
      city: "Tokyo",
      state: "Tokyo",
      country: "Japan"
    }
  }
]; 