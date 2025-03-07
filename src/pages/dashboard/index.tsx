import { Link, Navigate, useSearchParams } from "react-router-dom";

import Container from "@/components/layout/container";
import GlobalLayout from "@/components/layout/global-layout";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import Para from "@/components/ui/para";
import { UserAvatar } from "@/components/user-glance";

import useAuthStore from "@/models/auth";
import useBoardStore from "@/models/board";

import { ROUTE_MAP } from "@/data/routes";
import { cn, getRandomGreeting } from "@/lib/utils";

import AddProject from "./components/add-project";

const ROWS_PER_PAGE = 12;
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page");

  const { user, isAuth } = useAuthStore();
  const { projects } = useBoardStore();

  // TODO: there has be to be a better way
  if (!isAuth) {
    return <Navigate to={ROUTE_MAP.AUTH.LOGIN} replace />;
  }

  // only show project belogs to loggedIn user
  const userProjects = projects.filter((project) => project.createdBy === user.id);

  const currentPage = Number(page) || 1;
  const paginatedResponse = {
    results: userProjects.slice((currentPage - 1) * ROWS_PER_PAGE, ROWS_PER_PAGE * currentPage),
    count: userProjects.length,
  };

  const pageCount = Math.ceil(paginatedResponse.count / ROWS_PER_PAGE);

  return (
    <GlobalLayout>
      <Container size="full" className="flex flex-col space-y-8 h-full">
        <div className="flex justify-between items-center">
          <Heading size="title" variant="bold">
            Your Projects{" "}
            {userProjects.length ? (
              <span className="text-muted-foreground">({userProjects.length})</span>
            ) : null}
          </Heading>
          <AddProject />
        </div>

        {!paginatedResponse.count ? (
          <div className="py-20">
            <div className="flex justify-center flex-col items-center text-center">
              <div className="flex items-center space-x-2">
                <Heading size="xxl" variant="medium">
                  {getRandomGreeting()} {user.name}!
                </Heading>
                <UserAvatar src={user.profile} />
              </div>
              <Heading size="xxl" variant="medium" className="mt-1 mb-4">
                Go ahead and create some projects.
              </Heading>
              <AddProject />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 lg:grid-cols-2 sm:grid-cols-1">
            {paginatedResponse.results.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="py-10 !mt-auto">
          <Pagination
            currentPage={(Number(page) || 1) - 1}
            onPageChange={(event) => {
              const page = event.selected + 1;
              setSearchParams({ page });
            }}
            pageCount={pageCount}
          />
        </div>
      </Container>
    </GlobalLayout>
  );
}

function ProjectCard({ project }) {
  const { title, desc, coverImage } = project;
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 relative group cursor-pointer bg-muted/30 hover:bg-muted rounded-md transition-colors duration-200",
      )}>
      <div className="aspect-square max-h-44 shadow-md group-hover:shadow-xl transition-[shadow] duration-1000 rounded-md rounded-b-none overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 duration-1000"
        />
      </div>

      <div className="flex flex-col text-sm line-clamp-2 px-4 py-2">
        <Heading size="xl" className="line-clamp-1">
          {title}
        </Heading>
        <Para className="text-sm font-normal text-muted-foreground line-clamp-2">{desc}</Para>
      </div>

      <Link
        data-cy="project-card"
        to={`${ROUTE_MAP.PROJECT.BASE}/${project.id}`}
        className="absolute inset-0"
      />
    </div>
  );
}
