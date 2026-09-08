"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { ImageUploader } from "@/components/ui/image-uploader";
import AdminItemContainer from "@/app/components/admin/common/AdminItemContainer";
import { toast } from "sonner";
import { useEffect } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import Link from "next/link";
import CustomButton from "@/app/components/client/common/CustomButton";

interface HomeForm {
  firstSection: {
    isHidden: boolean;
    Image: string;
    ImageAlt: string;
    items: {
      title: string;
      description: string;
    }[];
  };
}

export default function HomePage() {
  const { register, handleSubmit, setValue, control, watch } =
    useForm<HomeForm>({
      defaultValues: {
        firstSection: {
          isHidden: false,
          Image: "",
          ImageAlt: "",
          items: [],
        },
      },
    });

  const {
    fields: firstItems,
    append: appendFirst,
    remove: removeFirst,
    replace: replaceFirst,
  } = useFieldArray({
    control,
    name: "firstSection.items",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/home");

      if (res.ok) {
        const { data } = await res.json();

        setValue("firstSection.isHidden", data.firstSection?.isHidden ?? false);

        setValue("firstSection.Image", data.firstSection?.Image ?? "");

        setValue("firstSection.ImageAlt", data.firstSection?.ImageAlt ?? "");

        replaceFirst(data.firstSection?.items || []);
      } else {
        const { message } = await res.json();
        toast.error(message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch home page data");
    }
  };

  const onSubmit = async (data: HomeForm) => {
    try {
      const res = await fetch("/api/admin/home", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const { message } = await res.json();
        toast.success(message);
      } else {
        const { message } = await res.json();
        toast.error(message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update home page");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {/* First Section */}
        <AdminItemContainer>
          <Label
            main
            isHidden={watch("firstSection.isHidden")}
            onToggleHidden={() =>
              setValue("firstSection.isHidden", !watch("firstSection.isHidden"))
            }
          >
            First Section
          </Label>

          <div className="p-5 flex flex-col gap-4">
            {/* Image */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Image</Label>

                <Controller
                  name="firstSection.Image"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Image Alt */}
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Image Alt</Label>

                <Input
                  {...register("firstSection.ImageAlt")}
                  placeholder="Image Alt"
                />
              </div>
            </div>

            {/* Items Header */}
            <div className="flex items-center justify-between mt-2">
              <Label className="font-bold">Items</Label>

              <Button
                type="button"
                addItem
                onClick={() =>
                  appendFirst({
                    title: "",
                    description: "",
                  })
                }
              >
                + Add Item
              </Button>
            </div>

            {/* Items */}
            <div className="grid grid-cols-2 gap-4">
              {firstItems.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-black/10 rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Item {index + 1}</Label>

                    <Button type="button" onClick={() => removeFirst(index)}>
                      <RiDeleteBinLine size={16} />
                    </Button>
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-2">
                    <Label className="font-bold">Title</Label>

                    <Input
                      {...register(`firstSection.items.${index}.title`)}
                      placeholder="Title"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <Label className="font-bold">Description</Label>

                    <Input
                      {...register(`firstSection.items.${index}.description`)}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminItemContainer>

        {/* Actions */}
        <div className="fixed top-2 right-8 z-50 flex gap-5">
          <Link href="/" target="_blank">
            <CustomButton variant="2" type="button" text="Visit Page" />
          </Link>

          <CustomButton
            variant="3"
            type="submit"
            text="Page Submit"
            showIcon={false}
          />
        </div>
      </form>
    </div>
  );
}
