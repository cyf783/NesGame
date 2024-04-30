import { ITreeItem } from "@/types";
import { useTreeStore } from "@/store";
const treeStore = useTreeStore();

export function useTreeDrag() {
  function dragStart(ev: DragEvent, node: ITreeItem) {}
  function dragOver(ev: DragEvent, node: ITreeItem) {}
  function dragLeave(ev: DragEvent, node: ITreeItem) {}

  function drop({
    dragNode,
    dropNode,
    dropPosition,
  }: {
    dragNode: any; // ITreeItem
    dropNode: any; // ITreeItem
    dropPosition: any; // number
  }) {
    const data = treeStore.data;
    const loop = (data: any, key: string, callback: any) => {
      // @ts-ignore
      data.some((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return true;
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
        return false;
      });
    };

    if (dropPosition === 0) {
      // @ts-ignore
      loop(data, dragNode.key, (_, index, arr) => {
        arr.splice(index, 1);
      });
      loop(data, dropNode.key, (item: any) => {
        item.children = item.children || [];
        item.children.push(dragNode);
      });
    } else {
        // @ts-ignore
        loop(data, dragNode.key, (_, index, arr) => {
          arr.splice(index, 1);
        });
        // @ts-ignore
        loop(data, dropNode.key, (_, index, arr) => {
          arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);
        });
    }
  }

  return {
    dragStart,
    dragOver,
    dragLeave,
    drop,
  };
}
