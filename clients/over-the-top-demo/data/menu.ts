import type { CategoryId, GroupId, MenuCategory, MenuGroup, MenuItem } from "@/lib/types";
import { photos } from "./photos";

/**
 * MENU DATA — the restaurant's complete public menu.
 *
 * Source: their own menu at /menu/over-the-top-burger-menu-v1, transcribed from
 * full-page captures on 2026-09-16. Their wording, their prices, their typos left
 * alone. Aggregator prices were removed once they proved stale — Uber Eats lists
 * Georgia Summer at $13.99 against $15.99 on the restaurant's own site.
 *
 * Rules any future edit must keep:
 *   1. No invented items, descriptions, prices or accolades.
 *   2. Unsourced detail is ABSENT, not guessed.
 *   3. Adding a photo = drop /public/menu/<id>.jpg and set `image`.
 */

const SRC = "Restaurant's own menu page, captured 2026-09-16";

/** Browsing groups. The UI uses these; the data keeps their real sections. */
export const groups: MenuGroup[] = [
  { id: "burgers", name: "Burgers", blurb: "Six-ounce patties, built tall, named loud." },
  { id: "mains", name: "Mains", blurb: "Sandwiches, pastas and salads beyond the burger." },
  { id: "starters", name: "Starters & Sides", blurb: "For the middle of the table." },
  { id: "sweets", name: "Sweets", blurb: "Decked shakes and cheesecake." },
  { id: "drinks", name: "Drinks", blurb: "Brunch cocktails, wine and margaritas." },
  { id: "filipino", name: "Filipino Menu", blurb: "A separate menu, served alongside." },
];

export const categories: MenuCategory[] = [
  {
    id: "burgers",
    group: "burgers",
    name: "Signature Burgers",
    blurb: "The reason people drive out here.",
    note: "All burgers are served with battered fries, a side of signature sauce (gluten free), and brown gravy.",
  },
  { id: "entrees", group: "mains", name: "Entrees", blurb: "Hot dogs, philly, and fried chicken." },
  { id: "pastas", group: "mains", name: "Pastas", blurb: "House alfredo, most ways you can think of." },
  { id: "salads", group: "mains", name: "Salads", blurb: "Lighter, and not an afterthought." },
  { id: "shareables", group: "starters", name: "Shareables", blurb: "Start here, with everyone." },
  { id: "wings", group: "starters", name: "Wings", blurb: "Traditional or boneless, by the ten." },
  { id: "sides", group: "starters", name: "Sides", blurb: "The supporting cast." },
  { id: "shakes", group: "sweets", name: "Shakes", blurb: "Decked, rimmed and over the top." },
  { id: "desserts", group: "sweets", name: "Desserts", blurb: "Cheesecake and chocolate cake." },
  { id: "kids", group: "mains", name: "Kids Meals", blurb: "12 years old and under.", note: "12 Years Old & Under. Comes with fries & a drink." },
  { id: "brunch", group: "drinks", name: "Brunch", blurb: "Sunday, from 11 AM." },
  { id: "margaritas", group: "drinks", name: "Margaritas", blurb: "Infused tequila, mostly spicy." },
  { id: "wine", group: "drinks", name: "Wine", blurb: "By the glass or the bottle." },
  {
    id: "filipino",
    group: "filipino",
    name: "Special Filipino Menu",
    blurb: "A separate Filipino menu served alongside the burger bar menu.",
    awaitingContent: true,
    emptyState: {
      title: "Ask what's on this week",
      body: "The Filipino menu runs alongside the burger bar menu. The kitchen will tell you what is on.",
    },
  },
];

const B = (id: string, name: string, description: string, extra: Partial<MenuItem> = {}): MenuItem => ({
  id, name, category: "burgers", description, descriptionProvenance: "verified", source: SRC, ...extra,
});

export const menuItems: MenuItem[] = [
  // ------------------------------------------------------- SIGNATURE BURGERS
  B("georgia-summer", "Georgia Summer",
    "All beef 6 oz. patties, peach-jalapeno chutney, pimento cheese, grilled onions, pickle, onion, & sig sauce.",
    { priceVariants: [{ label: "Single", price: 15.99 }, { label: "Double", price: 17.99 }],
      priceProvenance: "verified",
      // Their own claim, printed on their menu: "As featured on Fox News Atlanta!"
      accolade: "As featured on FOX 5 Atlanta", signature: true }),
  B("flaming-avalanche", "Flaming Avalanche",
    "All beef 6 oz. patties, pepper-jack cheese, Flamin' Hot Cheetos, scorpion glaze, pickle, onion, signature sauce, dipped in queso & Flamin' Hot Cheeto dust.",
    { priceVariants: [{ label: "Single", price: 14.99 }, { label: "Double", price: 17.99 }],
      priceProvenance: "verified", dietary: ["spicy"],
      accolade: "Featured on Food Paradise", signature: true }),
  B("the-hangover", "The Hangover",
    "All beef 6 oz. patties on a sugar waffle, candy peppered bacon, American cheese, fried egg, hash brown, maple syrup & top it off with a dusting of powdered sugar.",
    { price: 21.99, priceProvenance: "verified", signature: true }),
  B("unoriginal", "Unoriginal",
    "All beef 6 oz. patties, American cheese, tomato, pickle, onion & signature sauce.",
    { priceVariants: [{ label: "Single", price: 13.99 }, { label: "Double", price: 15.99 }], priceProvenance: "verified" }),
  B("bobs-your-uncle", "Bob's Your Uncle",
    "All beef 6 oz. patties, Swiss cheese, sauteed onions & mushrooms, onion rings, pickles, onions & signature sauce.",
    { priceVariants: [{ label: "Single", price: 17.99 }, { label: "Double", price: 20.99 }], priceProvenance: "verified" }),
  B("buford-blue", "Buford Blue",
    "All beef 6 oz patties, crumbled blue cheese, bacon-onion jam, tomato, pickle, onion & signature sauce.",
    { priceVariants: [{ label: "Single", price: 15.99 }, { label: "Double", price: 17.99 }], priceProvenance: "verified" }),
  B("hog-wild", "Hog Wild",
    "Slow-smoked pulled pork piled on a toasted brioche bun, topped with house BBQ sauce, creamy coleslaw, and crunchy pickles.",
    { price: 15.99, priceProvenance: "verified", dietary: ["contains-pork"] }),
  B("the-big-catch", "The Big Catch",
    "A perfectly seasoned, crisp salmon fillet nestled in a toasted bun, topped with fresh greens, cucumber, red onion & finished with a creamy dill ranch drizzle.",
    { price: 19.99, priceProvenance: "verified", dietary: ["seafood"] }),
  // Cracked Rear View is deliberately NOT listed. Buck Lanford named it in his
  // FOX 5 piece and the quote still runs on the restaurant's homepage, but the
  // dish is absent from their current printed menu — likely discontinued.
  // Listing a burger they may no longer sell is worse than omitting it; the
  // press quote carries the name on its own. Restore it here if they confirm.

  // ----------------------------------------------------------------- ENTREES
  { id: "holy-moly-dog", name: "Holy Moly Dog", category: "entrees", price: 18.99, priceProvenance: "verified",
    description: "Our 14\" all beef hot dog on a toasted amoroso roll topped with pressure-cooked chili, shredded cheddar cheese, house made beer cheese & diced onion.",
    descriptionProvenance: "verified", source: SRC },
  { id: "what-the-philly", name: "What the Philly?!", category: "entrees", price: 17.99, priceProvenance: "verified",
    description: "Seasoned steak, grilled onions, peppers, American & beer cheese, topped with our signature sauce.",
    descriptionProvenance: "verified", source: SRC },
  { id: "parmzilla", name: "Parmzilla", category: "entrees", price: 15.99, priceProvenance: "verified",
    description: "Crispy fried chicken, layered with melted mozzarella & parmesan cheese. Topped with a mozzarella patty for an extra crunch. All stacked between two toasted brioche buns and drizzled with rich marinara sauce.",
    descriptionProvenance: "verified", source: SRC },
  { id: "cluckin-strips", name: "Cluckin' Strips", category: "entrees", price: 15.99, priceProvenance: "verified",
    description: "Fried chicken tenders crispy on the outside & juicy on the inside. Served with a side of buttermilk ranch.",
    descriptionProvenance: "verified", source: SRC },

  // -------------------------------------------------------------- SHAREABLES
  { id: "the-samplers", name: "The Samplers", category: "shareables", price: 15.99, priceProvenance: "verified",
    description: "Best of all worlds: wings, jalapeño poppers, fried mozzarella, and Texas chicken rolls.",
    descriptionProvenance: "verified", signature: true, source: SRC },
  { id: "loaded-nachos", name: "Loaded Nachos", category: "shareables", price: 16.99, priceProvenance: "verified",
    description: "A tower of crispy tortilla chips loaded with your choice of chicken or beef, topped with shredded lettuce, tomatoes, jalapeños, onions, shredded cheese, & smooth nacho cheese.",
    descriptionProvenance: "verified", source: SRC },
  { id: "georgia-style-fries", name: "Georgia Style Fries", category: "shareables", price: 14.99, priceProvenance: "verified",
    description: "Pressure-cooked pulled pork, savory BBQ sauce, southern style coleslaw & topped with a fried egg.",
    descriptionProvenance: "verified", dietary: ["contains-pork"], source: SRC },
  { id: "texas-chicken-rolls", name: "Texas Chicken Rolls", category: "shareables", price: 10.99, priceProvenance: "verified",
    description: "Egg rolls packed with tender grilled chicken, black beans, corn bell peppers, spinach, & a blend of melted cheeses.",
    descriptionProvenance: "verified", source: SRC },
  { id: "jalapeno-poppers", name: "Jalapeño Poppers", category: "shareables", price: 9.99, priceProvenance: "verified",
    description: "Spicy jalapeños stuffed with creamy cheese & fried to crispy perfection.",
    descriptionProvenance: "verified", dietary: ["spicy", "vegetarian"], source: SRC },

  // ------------------------------------------------------------------- WINGS
  { id: "traditional-wings", name: "Traditional Wings", category: "wings",
    description: "Traditional wings come in 10pc, 20pc, and 30pc.", descriptionProvenance: "verified",
    priceVariants: [{ label: "10 piece", price: 15 }, { label: "20 piece", price: 25 }, { label: "30 piece", price: 35 }],
    priceProvenance: "verified", source: SRC },
  { id: "boneless-wings", name: "Boneless Wings", category: "wings",
    description: "Boneless wings come in 10pc, 20pc, and 30pc.", descriptionProvenance: "verified",
    priceVariants: [{ label: "10 piece", price: 17 }, { label: "20 piece", price: 28 }, { label: "30 piece", price: 38 }],
    priceProvenance: "verified", source: SRC },

  // ------------------------------------------------------------------- SIDES
  { id: "house-fries", name: "House Fries", category: "sides", price: 5, priceProvenance: "verified", source: SRC },
  { id: "sweet-potato-fries", name: "Sweet Potato Fries", category: "sides", price: 5, priceProvenance: "verified", source: SRC },
  { id: "green-beans", name: "Green Beans", category: "sides", price: 5, priceProvenance: "verified",
    description: "In a Tamari Glaze", descriptionProvenance: "verified", dietary: ["vegetarian"], source: SRC },
  { id: "cheese-curds", name: "Cheese Curds", category: "sides", price: 7, priceProvenance: "verified", source: SRC },
  { id: "onion-rings", name: "Onion Rings", category: "sides", price: 7, priceProvenance: "verified", source: SRC },
  { id: "coleslaw", name: "Coleslaw", category: "sides", price: 4, priceProvenance: "verified", source: SRC },
  // Prices for these two were cut off in the capture. Absent rather than guessed.
  { id: "sweet-potato-tots", name: "Sweet Potato Tots", category: "sides", source: SRC },
  { id: "tater-tots", name: "Tater Tots", category: "sides", source: SRC },

  // ------------------------------------------------------------------ PASTAS
  { id: "gold-coast-cadillac", name: "Gold Coast Cadillac", category: "pastas", price: 23.99, priceProvenance: "verified",
    description: "Juicy salmon & shrimp laid on a bed of creamy alfredo pasta.", descriptionProvenance: "verified",
    dietary: ["seafood"], source: SRC },
  { id: "smoke-on-the-water", name: "Smoke on the Water", category: "pastas", price: 16.99, priceProvenance: "verified",
    description: "Blackened salmon served over in house creamy alfredo pasta.", descriptionProvenance: "verified",
    dietary: ["seafood"], source: SRC },
  { id: "one-love", name: "One Love", category: "pastas", price: 15.99, priceProvenance: "verified",
    description: "Cajun alfredo pasta with grilled chicken, sauteed peppers & onions.", descriptionProvenance: "verified", source: SRC },
  { id: "bless-your-heart", name: "Bless Your Heart", category: "pastas", price: 15.99, priceProvenance: "verified",
    description: "Grilled chicken tossed in our rich alfredo sauce over penne.", descriptionProvenance: "verified", source: SRC },
  { id: "flower-power", name: "Flower Power", category: "pastas", price: 14.99, priceProvenance: "verified",
    description: "Veggie alfredo with sauteed mushrooms, broccoli, roasted red peppers & tossed in creamy alfredo sauce.",
    descriptionProvenance: "verified", dietary: ["vegetarian"], source: SRC },

  // ------------------------------------------------------------------ SALADS
  { id: "reel-deal", name: "Reel Deal", category: "salads", price: 17.99, priceProvenance: "verified",
    description: "Blackened or grilled salmon over fresh mixed greens, cherry tomatoes, pickled red onions, sweet corn & feta cheese. Served with a house-made honey citrus vinaigrette.",
    descriptionProvenance: "verified", dietary: ["seafood"], source: SRC },
  { id: "cactus-jack", name: "Cactus Jack", category: "salads",
    description: "Grilled chicken, romaine lettuce, corn, black beans, red bell peppers, tomatoes, onions, cheese and tortilla chips layered with a chipotle avocado dressing.",
    descriptionProvenance: "verified", source: SRC },
  { id: "the-beach-body", name: "The Beach Body", category: "salads", price: 12.99, priceProvenance: "verified",
    description: "Arugula, strawberries, brie, pickled red onion, crispy bacon & balsamic dressing with balsamic glazed grilled chicken.",
    descriptionProvenance: "verified", source: SRC },
  { id: "poblano-caesar", name: "Poblano Caesar", category: "salads", price: 9.99, priceProvenance: "verified",
    description: "Roasted poblano caesar dressing, croutons & shredded parmesan cheese.",
    descriptionProvenance: "verified", dietary: ["vegetarian"], source: SRC },

  // ------------------------------------------------------------------ SHAKES
  { id: "oreo-bomb", name: "Oreo Bomb", category: "shakes", price: 13.99, priceProvenance: "verified",
    description: "Vanilla ice cream, Oreo cookies, drizzled with chocolate sauce. Rimmed with chocolate ganache, topped with whipped cream & Oreo cheesecake wedge.",
    descriptionProvenance: "verified", signature: true, source: SRC },
  { id: "unicorn", name: "Unicorn", category: "shakes", price: 13.99, priceProvenance: "verified",
    description: "Strawberry ice cream, strawberries, cheesecake, whipped cream, rainbow sprinkles, waffle cone, and raspberry drizzle with a blue frosting rim.",
    descriptionProvenance: "verified", source: SRC },
  { id: "key-to-paradise", name: "Key to Paradise", category: "shakes", price: 13.99, priceProvenance: "verified",
    description: "Lime-infused vanilla ice cream, key lime pie, whipped cream, graham crackers, and a lime twist with a graham cracker-crusted rim.",
    descriptionProvenance: "verified", source: SRC },
  { id: "velvety-thicc", name: "Velvety Thicc", category: "shakes", price: 13.99, priceProvenance: "verified",
    description: "Red velvet-infused chocolate ice cream, whipped cream, chocolate syrup, raspberry drizzle, and red velvet cake with a chocolate frosting rim.",
    descriptionProvenance: "verified", source: SRC },
  { id: "cinnaswirl", name: "Cinnaswirl", category: "shakes", price: 11.99, priceProvenance: "verified",
    description: "Cinnamon infused ice cream, cinnamon toast crunch, caramel, whipped cream, caramel drizzle, Cinnamon Toast Crunch, topped with a cinnamon-sugar rim.",
    descriptionProvenance: "verified", source: SRC },
  { id: "cookie-monster", name: "Cookie Monster", category: "shakes", price: 11.99, priceProvenance: "verified",
    description: "Chocolate ice cream, chocolate syrup, cookie crumbles, whipped cream, and chocolate chips with a blue frosting rim.",
    descriptionProvenance: "verified", source: SRC },
  { id: "the-playground", name: "The Playground", category: "shakes", price: 11.99, priceProvenance: "verified",
    description: "Vanilla ice cream, fruity cereal, whipped cream, sprinkles, and Fruity Pebbles with a vanilla frosting rim.",
    descriptionProvenance: "verified", source: SRC },

  // ---------------------------------------------------------------- DESSERTS
  { id: "salted-caramel-smash", name: "Salted Caramel Smash", category: "desserts", price: 13, priceProvenance: "verified",
    description: "Creamy cheesecake topped with rich salted caramel, blending sweet and salty in every bite.",
    descriptionProvenance: "verified", source: SRC },
  { id: "chocolate-chaos", name: "Chocolate Chaos", category: "desserts", price: 11, priceProvenance: "verified",
    description: "Soft chocolate cake layered with smooth chocolate frosting for a classic treat.",
    descriptionProvenance: "verified", source: SRC },
  { id: "blueberry-bomb", name: "Blueberry Bomb", category: "desserts", price: 11, priceProvenance: "verified",
    description: "Rich cheesecake infused with juicy blueberries for a perfectly sweet and creamy bite.",
    descriptionProvenance: "verified", source: SRC },

  // -------------------------------------------------------------- KIDS MEALS
  { id: "kids-corn-dogs", name: "Bite-Sized All Beef Corn Dogs", category: "kids", price: 9.99, priceProvenance: "verified", source: SRC },
  { id: "kids-cheeseburger", name: "Cheeseburger", category: "kids", price: 9.99, priceProvenance: "verified", source: SRC },
  { id: "kids-pop-cone-chicken", name: "Pop-Cone Chicken", category: "kids", price: 9.99, priceProvenance: "verified", source: SRC },
  { id: "kids-hot-dog", name: "Hot Dog", category: "kids", price: 9.99, priceProvenance: "verified", source: SRC },
  { id: "kids-mac-and-cheese", name: "Mac & Cheese", category: "kids", price: 9.99, priceProvenance: "verified", source: SRC },

  // ------------------------------------------------------------------ BRUNCH
  { id: "brunch-punch", name: "Brunch Punch", category: "brunch", price: 10, priceProvenance: "verified",
    description: "Legends Vodka, Orange & Pineapple Juices, Muddled Strawberries & Mint.",
    descriptionProvenance: "verified", source: SRC },
  { id: "pomegranite-cosmo", name: "Pomegranite Cosmo", category: "brunch", price: 10, priceProvenance: "verified",
    description: "Vodka, Grand Marnier, Cranberry & Lime Juices Garnished With A Lime Twist.",
    descriptionProvenance: "verified", source: SRC },
  { id: "mimosa-pitcher", name: "Mimosa Pitcher", category: "brunch", price: 25, priceProvenance: "verified",
    description: "Prosecco on tap with our fresh orange juice.", descriptionProvenance: "verified", source: SRC },
  // Their own sub-header: "3 Tier Bloody Marys — No, you can't get 'just a Plain Jane' Bloody Mary."
  { id: "bloody-the-basic", name: "The Basic", category: "brunch", price: 16, priceProvenance: "verified",
    description: "Vodka, Bloody Mary mix, andouille sausage, candy peppered bacon, antipasto skewer, scorpion wing, topped with house made kettle chips, garlic cheese curds & served with a sidecar.",
    descriptionProvenance: "verified", source: SRC },
  { id: "bloody-the-bad", name: "The Bad", category: "brunch", price: 24, priceProvenance: "verified",
    description: "Vodka, Bloody Mary mix, andouille sausage, candy peppered bacon, antipasto skewer, scorpion wings (3), chicken and cheese taquitos, onion rings, topped with house made kettle chips, garlic cheese curds & served with a sidecar.",
    descriptionProvenance: "verified", source: SRC },
  { id: "bloody-the-boujee", name: "The Boujee", category: "brunch", price: 50, priceProvenance: "verified",
    description: "Vodka, Bloody Mary mix, andouille sausage, candy peppered bacon, antipasto skewer, scorpion wing (6), two single patty unoriginal's, stadium pretzel, 2 hot dogs, chicken & cheese taquitos, topped with house.",
    descriptionProvenance: "verified", signature: true, source: SRC },

  // -------------------------------------------------------------- MARGARITAS
  { id: "jalapeno-sugar-rush", name: "Jalapeno Sugar Rush", category: "margaritas",
    description: "Jalapeno-infused tequila, lemonade, Cointreau, fresh jalapenos.",
    descriptionProvenance: "verified", dietary: ["spicy"], source: SRC },
  { id: "heat-wave", name: "Heat Wave", category: "margaritas",
    description: "Habanero-infused tequila, lime juice, Cointreau.",
    descriptionProvenance: "verified", dietary: ["spicy"], source: SRC },
  { id: "cactus-nectar", name: "Cactus Nectar", category: "margaritas",
    description: "Gold rum, coconut rum, silver rum, Midori Melon liqueur, pineapple juice, blue liqueur, sweet & sour.",
    descriptionProvenance: "verified", source: SRC },

  // -------------------------------------------------------------------- WINE
  { id: "emmolo-sauvignon-blanc", name: "Emmolo Sauvignon Blanc", category: "wine",
    priceVariants: [{ label: "Glass", price: 8 }, { label: "Bottle", price: 40 }], priceProvenance: "verified", source: SRC },
  { id: "seasun-chardonnay", name: "Seasun Chardonnay", category: "wine",
    priceVariants: [{ label: "Glass", price: 9 }, { label: "Bottle", price: 35 }], priceProvenance: "verified", source: SRC },
  { id: "seven-daughters", name: "Seven Daughters", category: "wine",
    priceVariants: [{ label: "Glass", price: 8 }, { label: "Bottle", price: 40 }], priceProvenance: "verified", source: SRC },
  { id: "bonanza-cabernet", name: "Bonanza Cabernet Sauvignon", category: "wine",
    priceVariants: [{ label: "Glass", price: 9 }, { label: "Bottle", price: 45 }], priceProvenance: "verified", source: SRC },
  { id: "iron-and-sand-cabernet", name: "Iron and Sand Cabernet Sauvignon", category: "wine",
    priceVariants: [{ label: "Glass", price: 9 }, { label: "Bottle", price: 45 }], priceProvenance: "verified", source: SRC },
  { id: "j-lohr-pure-paso", name: "J Lohr Pure Paso", category: "wine",
    priceVariants: [{ label: "Glass", price: 8 }, { label: "Bottle", price: 30 }], priceProvenance: "verified", source: SRC },
  // Their site lists glass and bottle at the same $30. Almost certainly a data-entry
  // error on their menu; recorded as printed and flagged for the owner, not silently fixed.
  { id: "maggio-pinot-grigio", name: "Maggio Pinot Grigio", category: "wine",
    priceVariants: [{ label: "Glass", price: 30 }, { label: "Bottle", price: 30 }], priceProvenance: "verified", source: SRC },
];

/**
 * Photographs live in `data/photos.ts`, which `scripts/ingest-photos.mjs` writes
 * from whatever real images have actually been supplied. Attaching them here
 * rather than inside each item keeps this file a record of the printed menu and
 * nothing else — and means a photo drop never touches a price.
 */
for (const item of menuItems) {
  const photo = photos[item.id];
  if (photo) item.image = photo;
}

export const signatureItems = menuItems.filter((item) => item.signature);

export function itemsIn(category: CategoryId): MenuItem[] {
  return menuItems.filter((item) => item.category === category);
}
export function categoriesInGroup(group: GroupId): MenuCategory[] {
  return categories.filter((category) => category.group === group);
}
export function itemsInGroup(group: GroupId): MenuItem[] {
  const ids = new Set(categoriesInGroup(group).map((c) => c.id));
  return menuItems.filter((item) => ids.has(item.category));
}
export function categoryById(id: CategoryId): MenuCategory | undefined {
  return categories.find((category) => category.id === id);
}
export function itemCount(category: CategoryId): number {
  return itemsIn(category).length;
}
