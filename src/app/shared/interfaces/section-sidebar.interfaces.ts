export interface IItemSection {
  title: string;
  description?: string;
  url: string;
  params?: { [key: string]: string | number | boolean };
}

export interface ISectionSidebar {
  name: string;
  hrName?: string;
  items: IItemSection[]
}