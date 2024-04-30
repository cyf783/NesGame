import { ITreeItem } from "@/types";
import md5 from "md5";

/**
 * 找到key节点的最近父节点
 */
export function findParent(key: string, treeData: ITreeItem[]): ITreeItem[] {
  const parent: ITreeItem[] = [];
  treeData.forEach((item) => {
    if (item.children) {
      if (item.children.some((child) => child.key === key)) {
        parent.push(item);
      } else {
        parent.push(...findParent(key, item.children));
      }
    }
  });
  return parent;
}

/**
 * 找到key节点
 */
export function findNodeByKey(key: string, treeData: ITreeItem[]) {
  const loop: (...args: any[]) => ITreeItem | undefined = (
    data: ITreeItem[]
  ) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      // 找到匹配的节点
      if (item.key === key) {
        return item;
      } else if (item.children?.length) {
        // 继续遍历子节点
        const filterData = loop(item.children);
        if (filterData) {
          return filterData;
        }
      }
    }
  };

  return loop(treeData);
}

/**
 * 收集key节点的所有父节点的key
 */
export function collectAllParentKeys(
  key: string,
  treeData: ITreeItem[]
): string[] {
  const keys = [];
  let parent = findParent(key, treeData);
  while (parent.length) {
    keys.push(parent[0].key);
    parent = findParent(parent[0].key, treeData);
  }
  return keys;
}

/**
 * 根据关键字过滤节点
 */
export function filterNode(keyword: string, treeData: ITreeItem[]) {
  const loop: (...args: any[]) => ITreeItem[] = (data: ITreeItem[]) => {
    const result: ITreeItem[] = [];
    data.forEach((item) => {
      if (item.children) {
        const children = loop(item.children);
        if (children.length) {
          result.push({
            ...item,
            children,
          });
        }
      } else if (item.title.includes(keyword)) {
        result.push(item);
      }
    });
    return result;
  };

  return loop(treeData);
}

/**
 * 第一个节点
 */
export function firstNode(files: ITreeItem[]): ITreeItem | null {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.children) {
      return file;
    } else {
      if (file.children) {
        return firstNode(file.children);
      }
    }
  }
  return null;
}


/**
 * 生成游戏key
 * @param txt
 * @returns
 */
export function createKey(...str:string[]): string {
  return md5(str.join("-"));
}
