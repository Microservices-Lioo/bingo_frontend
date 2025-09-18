export interface IItemSection {
  id: number;
  title: string;
  description?: string;
  url: string;
  params?: { [key: string]: string | number | boolean };
  actived: boolean;
}

export interface ISectionSidebar {
  id: number;
  name: string;
  hrName?: string;
  items: IItemSection[]
}