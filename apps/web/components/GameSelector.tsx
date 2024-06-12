"use client";

import { Card, CardContent, CardHeader } from "@ui/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@ui/components/ui/carousel";
import { useRouter } from "next/navigation";
import React from "react";

const GameSelector = () => {
  const router = useRouter();

  return (
    <Carousel className="w-full h-full max-w-xs">
      <CarouselPrevious />
      <CarouselContent className="h-full">
        <CarouselItem className="h-full">
          <Card
            onClick={() => {
              router.push("/chess");
            }}
            className="overflow-hidden h-full hover:scale-[1.01] hover:cursor-pointer transition-transform"
          >
            <CardHeader className="p-0" />
            <CardContent className="flex flex-col justify-between items-center p-0 h-full">
              <div className="basis-[70%] overflow-hidden">
                <img
                  className="w-full"
                  src="/chess_image.webp"
                  alt="chess image"
                />
              </div>
              <div className="w-full basis-[30%] flex justify-center items-center text-3xl font-semibold">
                Chess
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
        <CarouselItem className="h-full">
          <Card className="overflow-hidden h-full hover:scale-[1.01] hover:cursor-pointer transition-transform">
            <CardHeader className="p-0" />
            <CardContent className="flex flex-col justify-center text-2xl items-center px-8 h-full">
              More games coming soon ...
            </CardContent>
          </Card>
        </CarouselItem>
      </CarouselContent>
      <CarouselNext />
    </Carousel>
  );
};

export default GameSelector;
