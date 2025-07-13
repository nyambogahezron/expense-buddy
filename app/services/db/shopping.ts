import { eq, desc, asc, sql, and, like } from 'drizzle-orm';
import { db } from '@/db';
import { shoppingLists, shoppingItems } from '@/db/schema';
import { ShoppingList, ShoppingItem, Priority } from '@/types/shopping';

const toListModel = (
	record: typeof shoppingLists.$inferSelect,
	items: ShoppingItem[]
): ShoppingList => {
	const totalEstimatedCost = items.reduce(
		(sum, item) => sum + item.estimatedCost,
		0
	);
	const completed = items.length > 0 && items.every((item) => item.purchased);

	return {
		id: record.id.toString(),
		name: record.name,
		store: record.store || undefined,
		items,
		totalEstimatedCost,
		completed,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
};

const toItemModel = (
	record: typeof shoppingItems.$inferSelect
): ShoppingItem => ({
	id: record.id.toString(),
	name: record.name,
	category: 'other',
	quantity: record.quantity,
	estimatedCost: record.estimatedCost,
	priority: record.priority as Priority,
	purchased: record.purchased,
	createdAt: record.createdAt.toISOString(),
	updatedAt: record.updatedAt.toISOString(),
});

export const getAllShoppingLists = async (): Promise<ShoppingList[]> => {
	const listRecords = await db
		.select()
		.from(shoppingLists)
		.orderBy(desc(shoppingLists.createdAt));

	const lists: ShoppingList[] = [];
	for (const listRecord of listRecords) {
		const itemRecords = await db
			.select()
			.from(shoppingItems)
			.where(eq(shoppingItems.listId, listRecord.id))
			.orderBy(desc(shoppingItems.priority), asc(shoppingItems.name));

		lists.push(toListModel(listRecord, itemRecords.map(toItemModel)));
	}

	return lists;
};

export const getShoppingListById = async (
	id: string
): Promise<ShoppingList | null> => {
	const listRecords = await db
		.select()
		.from(shoppingLists)
		.where(eq(shoppingLists.id, parseInt(id)));

	if (listRecords.length === 0) {
		return null;
	}

	const itemRecords = await db
		.select()
		.from(shoppingItems)
		.where(eq(shoppingItems.listId, parseInt(id)))
		.orderBy(desc(shoppingItems.priority), asc(shoppingItems.name));

	return toListModel(listRecords[0], itemRecords.map(toItemModel));
};

export const createShoppingList = async (
	list: Omit<
		ShoppingList,
		| 'id'
		| 'createdAt'
		| 'updatedAt'
		| 'items'
		| 'totalEstimatedCost'
		| 'completed'
	>
): Promise<ShoppingList> => {
	const now = new Date();

	const values = {
		name: list.name,
		store: list.store || '',
		createdAt: now,
		updatedAt: now,
	};

	await db.insert(shoppingLists).values(values);

	const result = await db
		.select()
		.from(shoppingLists)
		.orderBy(shoppingLists.id)
		.limit(1);
	return getShoppingListById(result[0].id.toString()) as Promise<ShoppingList>;
};

export const updateShoppingList = async (
	id: string,
	list: Partial<
		Omit<
			ShoppingList,
			| 'id'
			| 'createdAt'
			| 'updatedAt'
			| 'items'
			| 'totalEstimatedCost'
			| 'completed'
		>
	>
): Promise<void> => {
	const updates: Partial<typeof shoppingLists.$inferInsert> = {};

	if (list.name !== undefined) updates.name = list.name;
	if (list.store !== undefined) updates.store = list.store;

	if (Object.keys(updates).length > 0) {
		updates.updatedAt = new Date();
		await db
			.update(shoppingLists)
			.set(updates)
			.where(eq(shoppingLists.id, parseInt(id)));
	}
};

export const deleteShoppingList = async (id: string): Promise<void> => {
	await db.delete(shoppingLists).where(eq(shoppingLists.id, parseInt(id)));
};

export const addShoppingItem = async (
	listId: string,
	item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ShoppingItem> => {
	const now = new Date();

	const values = {
		listId: parseInt(listId),
		name: item.name,
		quantity: item.quantity,
		estimatedCost: item.estimatedCost,
		priority: item.priority,
		purchased: item.purchased,
		createdAt: now,
		updatedAt: now,
	};

	await db.insert(shoppingItems).values(values);

	const result = await db
		.select()
		.from(shoppingItems)
		.orderBy(shoppingItems.id)
		.limit(1);

	return toItemModel(result[0]);
};

export const updateShoppingItem = async (
	id: string,
	item: Partial<Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
	const updates: Partial<typeof shoppingItems.$inferInsert> = {};

	if (item.name !== undefined) updates.name = item.name;
	if (item.quantity !== undefined) updates.quantity = item.quantity;
	if (item.estimatedCost !== undefined)
		updates.estimatedCost = item.estimatedCost;
	if (item.priority !== undefined) updates.priority = item.priority;
	if (item.purchased !== undefined) updates.purchased = item.purchased;

	if (Object.keys(updates).length > 0) {
		updates.updatedAt = new Date();
		await db
			.update(shoppingItems)
			.set(updates)
			.where(eq(shoppingItems.id, parseInt(id)));
	}
};

export const deleteShoppingItem = async (id: string): Promise<void> => {
	await db.delete(shoppingItems).where(eq(shoppingItems.id, parseInt(id)));
};

export const toggleItemPurchased = async (
	id: string,
	purchased: boolean
): Promise<void> => {
	await db
		.update(shoppingItems)
		.set({
			purchased,
			updatedAt: new Date(),
		})
		.where(eq(shoppingItems.id, parseInt(id)));
};

export const getShoppingListAnalytics = async (
	listId?: string
): Promise<{
	totalLists: number;
	totalItems: number;
	totalEstimatedCost: number;
	completedItems: number;
	completionRate: number;
	averageItemCost: number;
	priorityBreakdown: { priority: Priority; count: number; cost: number }[];
}> => {
	const whereClause = listId
		? eq(shoppingItems.listId, parseInt(listId))
		: undefined;

	// Get total lists count
	const totalListsResult = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(shoppingLists);
	const totalLists = totalListsResult[0]?.count || 0;

	// Get items analytics
	const itemsAnalytics = await db
		.select({
			totalItems: sql<number>`COUNT(*)`,
			totalCost: sql<number>`SUM(${shoppingItems.estimatedCost})`,
			completedItems: sql<number>`SUM(CASE WHEN ${shoppingItems.purchased} = 1 THEN 1 ELSE 0 END)`,
			avgCost: sql<number>`AVG(${shoppingItems.estimatedCost})`,
		})
		.from(shoppingItems)
		.where(whereClause);

	const analytics = itemsAnalytics[0];

	// Get priority breakdown
	const priorityBreakdown = await db
		.select({
			priority: shoppingItems.priority,
			count: sql<number>`COUNT(*)`,
			cost: sql<number>`SUM(${shoppingItems.estimatedCost})`,
		})
		.from(shoppingItems)
		.where(whereClause)
		.groupBy(shoppingItems.priority);

	return {
		totalLists,
		totalItems: analytics?.totalItems || 0,
		totalEstimatedCost: analytics?.totalCost || 0,
		completedItems: analytics?.completedItems || 0,
		completionRate: analytics?.totalItems
			? (analytics.completedItems / analytics.totalItems) * 100
			: 0,
		averageItemCost: analytics?.avgCost || 0,
		priorityBreakdown: priorityBreakdown.map((p) => ({
			priority: p.priority as Priority,
			count: p.count,
			cost: p.cost,
		})),
	};
};

export const getShoppingListsByStore = async (): Promise<
	{ store: string; count: number; totalCost: number }[]
> => {
	const storeAnalytics = await db
		.select({
			store: shoppingLists.store,
			count: sql<number>`COUNT(*)`,
			totalCost: sql<number>`SUM(${shoppingItems.estimatedCost})`,
		})
		.from(shoppingLists)
		.leftJoin(shoppingItems, eq(shoppingLists.id, shoppingItems.listId))
		.groupBy(shoppingLists.store)
		.orderBy(desc(sql`COUNT(*)`));

	return storeAnalytics.map((s) => ({
		store: s.store || 'No Store',
		count: s.count,
		totalCost: s.totalCost || 0,
	}));
};

export const getShoppingItemsByPriority = async (
	priority: Priority
): Promise<ShoppingItem[]> => {
	const itemRecords = await db
		.select()
		.from(shoppingItems)
		.where(eq(shoppingItems.priority, priority))
		.orderBy(desc(shoppingItems.createdAt));

	return itemRecords.map(toItemModel);
};

export const searchShoppingItems = async (
	query: string
): Promise<ShoppingItem[]> => {
	const itemRecords = await db
		.select()
		.from(shoppingItems)
		.where(like(shoppingItems.name, `%${query}%`))
		.orderBy(desc(shoppingItems.createdAt));

	return itemRecords.map(toItemModel);
};

export const getShoppingItemsNearBudget = async (
	budgetThreshold: number = 100
): Promise<ShoppingItem[]> => {
	const itemRecords = await db
		.select()
		.from(shoppingItems)
		.where(
			and(
				sql`${shoppingItems.estimatedCost} >= ${budgetThreshold}`,
				eq(shoppingItems.purchased, false)
			)
		)
		.orderBy(desc(shoppingItems.estimatedCost));

	return itemRecords.map(toItemModel);
};

export const getCompletedShoppingLists = async (): Promise<ShoppingList[]> => {
	const listRecords = await db
		.select()
		.from(shoppingLists)
		.orderBy(desc(shoppingLists.updatedAt));

	const completedLists: ShoppingList[] = [];

	for (const listRecord of listRecords) {
		const itemRecords = await db
			.select()
			.from(shoppingItems)
			.where(eq(shoppingItems.listId, listRecord.id));

		const items = itemRecords.map(toItemModel);
		const list = toListModel(listRecord, items);

		if (list.completed) {
			completedLists.push(list);
		}
	}

	return completedLists;
};

export const markAllItemsAsPurchased = async (
	listId: string
): Promise<void> => {
	await db
		.update(shoppingItems)
		.set({
			purchased: true,
			updatedAt: new Date(),
		})
		.where(eq(shoppingItems.listId, parseInt(listId)));
};

export const duplicateShoppingList = async (
	listId: string,
	newName?: string
): Promise<ShoppingList> => {
	const originalList = await getShoppingListById(listId);
	if (!originalList) {
		throw new Error('Shopping list not found');
	}

	// Create new list
	const newList = await createShoppingList({
		name: newName || `${originalList.name} (Copy)`,
		store: originalList.store,
	});

	// Copy all items
	for (const item of originalList.items) {
		await addShoppingItem(newList.id, {
			name: item.name,
			category: item.category,
			quantity: item.quantity,
			estimatedCost: item.estimatedCost,
			priority: item.priority,
			purchased: false,
		});
	}

	return getShoppingListById(newList.id) as Promise<ShoppingList>;
};
